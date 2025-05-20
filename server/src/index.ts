
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

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  // Add production domain if needed
];

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

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) === -1) {
      // If not in the list but we want to allow it anyway
      // You can modify this to be more restrictive
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Add frontend domain to request object
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).frontendDomain = getFrontendDomain(req);
  next();
});

// Set CORS headers for all responses
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
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
}, express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/qrcodes', auth, qrCodeRoutes);
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
