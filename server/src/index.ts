import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import userRoutes from './routes/userRoutes';
import qrCodeRoutes from './routes/qrCodeRoutes';
import landingRoutes from './routes/landingRoutes';
import adminRoutes from './routes/adminRoutes';
import { auth, generateAuthToken } from './middleware/auth';
import { AuthRequest } from './middleware/auth';
import axios from 'axios';
import { User } from './models/User';
import bcrypt from 'bcryptjs';
import { Worker } from 'worker_threads';

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

// Enhanced compression settings with better performance
app.use(compression({
  level: 4, // Reduced compression level for better performance
  threshold: 512, // Compress responses larger than 512B
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

// Optimized CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://qrme.netlify.app',
      'https://www.qrcreator.xyz',
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
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Accept',
    'Origin',
    'X-Auth-Token'
  ],
  exposedHeaders: ['X-Auth-Token'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
}));

// Optimized security headers with Helmet
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
  crossOriginEmbedderPolicy: false, // Disable for better performance
  crossOriginResourcePolicy: false, // Disable for better performance
  crossOriginOpenerPolicy: false // Disable for better performance
}));

// Optimize JSON parsing
app.use(express.json({ 
  limit: '1mb',
  strict: false // Disable strict mode for better performance
}));

// Add frontend domain to request object
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).frontendDomain = getFrontendDomain(req);
  next();
});

// Optimize static file serving with aggressive caching
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
    // Add cache control headers
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// Token refresh endpoint
app.post('/api/users/refresh-token', auth, (req: AuthRequest, res: express.Response) => {
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

// Background job worker for keeping the server alive
const startKeepAliveWorker = () => {
  const worker = new Worker(`
    const { parentPort } = require('worker_threads');
    const axios = require('axios');

    let lastActivityTime = Date.now();
    let isRunning = true;

    // Function to ping the server
    const pingServer = async () => {
      try {
        // Use the actual server URL from environment
        const serverUrl = process.env.SERVER_URL || 'https://quickqr-heyg.onrender.com';
        console.log('Background job: Attempting to ping server at', serverUrl);
        
        // Make a single health check request
        const response = await axios.get(\`\${serverUrl}/api/health\`, {
          timeout: 5000, // 5 second timeout
          headers: {
            'User-Agent': 'QuickQR-KeepAlive/1.0'
          }
        });
        
        if (response.status === 200) {
          console.log('Background job: Ping successful');
        } else {
          throw new Error(\`Unexpected status code: \${response.status}\`);
        }
      } catch (error) {
        console.error('Background job: Ping failed:', error.message);
        // If ping fails, try again after a delay
        setTimeout(pingServer, 30000); // Retry after 30 seconds
      }
    };

    // Check every 5 minutes
    const interval = setInterval(() => {
      if (!isRunning) {
        clearInterval(interval);
        return;
      }
      pingServer();
    }, 5 * 60 * 1000);

    // Initial ping after 10 seconds
    setTimeout(pingServer, 10000);

    // Handle messages from main thread
    parentPort.on('message', (message) => {
      if (message === 'stop') {
        isRunning = false;
        clearInterval(interval);
        parentPort.postMessage('stopped');
      } else if (message === 'updateActivity') {
        lastActivityTime = Date.now();
      }
    });

    // Handle worker termination
    process.on('SIGTERM', () => {
      isRunning = false;
      clearInterval(interval);
      process.exit(0);
    });
  `, { eval: true });

  worker.on('error', (error) => {
    console.error('Background job worker error:', error);
    // Restart the worker if it crashes
    setTimeout(startKeepAliveWorker, 5000);
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Background job worker stopped with exit code ${code}`);
      // Restart the worker if it exits unexpectedly
      setTimeout(startKeepAliveWorker, 5000);
    }
  });

  return worker;
};

// Start the background worker
const keepAliveWorker = startKeepAliveWorker();

// Update last activity time on each request and notify the worker
app.use((req, res, next) => {
  keepAliveWorker.postMessage('updateActivity');
  next();
});

// Cleanup on server shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  keepAliveWorker.postMessage('stop');
  await AppDataSource.destroy();
  process.exit(0);
};

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/landing', landingRoutes);

// Function to create admin user
async function createAdminUser() {
  try {
    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@quickqr.com' } });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

    const admin = userRepository.create({
      email: 'admin@quickqr.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      trialStartDate,
      trialEndDate,
      isActive: true,
      hasActiveSubscription: true
    });

    await userRepository.save(admin);
    console.log('Admin user created successfully with email: admin@quickqr.com and password: admin123');
  } catch (error) {
    console.error('Error creating admin:', error);
    // Retry once if failed
    try {
      const userRepository = AppDataSource.getRepository(User);
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const admin = userRepository.create({
        email: 'admin@quickqr.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        trialStartDate,
        trialEndDate,
        isActive: true,
        hasActiveSubscription: true
      });

      await userRepository.save(admin);
      console.log('Admin user created successfully on retry');
    } catch (retryError) {
      console.error('Failed to create admin user after retry:', retryError);
    }
  }
}

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize database with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await AppDataSource.initialize();
        console.log('Database connected successfully');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        console.log(`Database connection failed. Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Create admin user
    await createAdminUser();

    // Start server
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Enhanced server shutdown handling
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
};

startServer();
