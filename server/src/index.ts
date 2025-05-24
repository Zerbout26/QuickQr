import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from './config/database';
import userRoutes from './routes/userRoutes';
import qrCodeRoutes from './routes/qrCodeRoutes';
import landingRoutes from './routes/landingRoutes';
import { auth, generateAuthToken } from './middleware/auth';
import { AuthRequest } from './middleware/auth';
import axios from 'axios';
import compression from 'compression';
import helmet from 'helmet';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));

// Compression middleware
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Function to get the server's own URL
const getServerUrl = () => {
  // If running on Render, use the RENDER_EXTERNAL_URL environment variable
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }
  
  // If running on localhost, use the PORT environment variable or default to 3000
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
};

// Self-ping function to keep the server active
const pingServer = async () => {
  try {
    const serverUrl = getServerUrl();
    console.log('Pinging server at:', serverUrl);
    const response = await axios.get(`${serverUrl}/health`);
    console.log('Server pinged successfully:', response.data);
  } catch (error) {
    console.error('Error pinging server:', error);
  }
};

// Start the self-ping interval
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(pingServer, PING_INTERVAL);

// Initial ping
pingServer();

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

// Increase JSON payload limit for larger QR codes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add frontend domain to request object
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).frontendDomain = getFrontendDomain(req);
  next();
});

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

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });
