import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from './config/database';
import userRoutes from './routes/userRoutes';
import qrCodeRoutes from './routes/qrCodeRoutes';
import { auth } from './middleware/auth';

const app = express();

// Get the domain from environment variable or use a default
const getDomain = (req: express.Request) => {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = req.get('host') || 'localhost:8080';
  return `${protocol}://${host}`;
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
app.use(cors());
app.use(express.json());

// Add domain to request object
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  (req as any).domain = getDomain(req);
  next();
});

// Serve static files from the uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/qrcodes', auth, qrCodeRoutes);

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