import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { AppDataSource } from './config/database';
import userRoutes from './routes/userRoutes';
import qrCodeRoutes from './routes/qrCodeRoutes';
import landingRoutes from './routes/landingRoutes';
import { auth, generateAuthToken } from './middleware/auth';
import { AuthRequest } from './middleware/auth';
import axios from 'axios';

const app = express();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all routes
app.use(limiter);

// Enable compression for all responses
app.use(compression());

// Get the frontend domain from the request origin
const getFrontendDomain = (req: express.Request) => {
  const origin = req.get('origin');
  if (origin) {
    return origin;
  }
  // Fallback to environment variable or default
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

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://warm-pithivier-90ecdb.netlify.app', // Production frontend URL
      'http://localhost:8080',  // Development frontend URL
      'http://localhost:5173'   // Vite default development URL
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
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
  credentials: true
}));
app.use(express.json());

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Add frontend domain to request object
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).frontendDomain = getFrontendDomain(req);
  next();
});

// Serve static files from the uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for static files
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// Add token refresh endpoint
app.post('/api/users/refresh-token', auth, (req: AuthRequest, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Generate a new token
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

// Self-ping function to keep the server alive
const pingServer = async () => {
  try {
    const serverUrl = process.env.SERVER_URL || 'https://your-render-app-url.onrender.com';
    await axios.get(`${serverUrl}/api/health`);
    console.log('Server self-ping successful');
  } catch (error) {
    console.error('Server self-ping failed:', error);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Initialize database connection with optimized settings
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Start self-ping every 10 minutes
      setInterval(pingServer, 10 * 60 * 1000);
      
      // Initial ping
      pingServer();
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1); // Exit if database connection fails
  });

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
