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
import { auth, generateAuthToken } from './middleware/auth';
import { AuthRequest } from './middleware/auth';
import axios from 'axios';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

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
  }
}));

app.use(express.json({ limit: '1mb' }));

// Add frontend domain to request object
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).frontendDomain = getFrontendDomain(req);
  next();
});

// Optimize static file serving
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

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
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
    const shutdown = async () => {
      console.log('Shutdown signal received');
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
          console.log('Database connection closed');
        }
        
        process.exit(0);
      });
      
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
};

startServer();
