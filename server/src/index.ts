import express from 'express';
import cors from 'cors';
import path from 'path';
import { AppDataSource } from './config/database';
import userRoutes from './routes/userRoutes';
import qrCodeRoutes from './routes/qrCodeRoutes';
import landingRoutes from './routes/landingRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/qrcodes', qrCodeRoutes);
app.use('/landing', landingRoutes);

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  }); 