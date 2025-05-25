import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import userRoutes from './routes/userRoutes';
import qrCodeRoutes from './routes/qrCodeRoutes';
import landingRoutes from './routes/landingRoutes';
import { auth, generateAuthToken } from './middleware/auth';
import { AuthRequest } from './middleware/auth';
import axios from 'axios';
import cluster from 'cluster';
import os from 'os';

const app = express();

// Get server URL from request or environment
const getServerUrl = (req?: express.Request): string => {
  if (req) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    if (protocol && host) {
      return `${protocol}://${host}`;
    }
  }
  
  const port = process.env.PORT || 10000;
  return process.env.NODE_ENV === 'production' 
    ? process.env.SERVER_URL || `http://localhost:${port}`
    : `http://localhost:${port}`;
};

// Enhanced rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/uploads/'), // Skip rate limiting for static files
  keyGenerator: (req) => {
    // Use IP + User Agent for better rate limiting
    return `${req.ip}-${req.headers['user-agent']}`;
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// Enhanced compression settings
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Get the frontend domain from the request origin
const getFrontendDomain = (req: express.Request) => {
  const origin = req.get('origin');
  if (origin) {
    return origin;
  }
  return process.env.FRONTEND_URL || 'http://localhost:8080';
};

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, '../uploads');
const logosDir = path.join(uploadsDir, 'logos');
const itemsDir = path.join(uploadsDir, 'items');

[uploadsDir, logosDir, itemsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Enhanced CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://warm-pithivier-90ecdb.netlify.app',
      'http://localhost:8080',
      'http://localhost:5173'
    ];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Enhanced security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: true },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

app.use(express.json({ limit: '1mb' })); // Limit JSON payload size

// Add frontend domain to request object
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).frontendDomain = getFrontendDomain(req);
  next();
});

// Optimized static file serving
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Vary', 'Accept-Encoding');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  immutable: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Token refresh endpoint with rate limiting
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit to 5 refresh attempts per 15 minutes
  message: 'Too many token refresh attempts, please try again later.'
});

app.post('/api/users/refresh-token', refreshLimiter, auth, (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = generateAuthToken(req.user.id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
app.use('/landing', landingRoutes);

// Enhanced self-ping function
const pingServer = async (req?: express.Request) => {
  try {
    const serverUrl = getServerUrl(req);
    const response = await axios.get(`${serverUrl}/api/health`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Server-Self-Ping'
      }
    });
    
    if (response.status === 200) {
      console.log('Server self-ping successful');
    } else {
      console.error('Server self-ping failed with status:', response.status);
    }
  } catch (error) {
    console.error('Server self-ping failed:', error);
  }
};

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
  const serverUrl = getServerUrl(req);
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    serverUrl: serverUrl,
    environment: process.env.NODE_ENV || 'development',
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB'
    },
    database: {
      connected: AppDataSource.isInitialized,
      poolSize: AppDataSource.options.extra?.max || 20
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');
    
    const PORT = process.env.PORT || 10000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Start self-ping every 10 minutes
      setInterval(() => pingServer(), 10 * 60 * 1000);
      
      // Initial ping
      pingServer();
    });

    // Enhanced server shutdown handling
    const shutdown = async () => {
      console.log('Shutdown signal received');
      
      // Close server
      server.close(async () => {
        console.log('HTTP server closed');
        
        // Close database connection
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
          console.log('Database connection closed');
        }
        
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
};

// Start server in cluster mode if in production
if (process.env.NODE_ENV === 'production' && cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking for ${numCPUs} CPUs`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // Replace the dead worker
    cluster.fork();
  });
} else {
  startServer();
}

// Enhanced global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
