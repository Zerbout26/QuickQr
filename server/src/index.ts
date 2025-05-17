import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './config/database';
import { User } from './models/User';
import userRoutes from './routes/userRoutes';
import qrCodeRoutes from './routes/qrCodeRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/qrcodes', qrCodeRoutes);

// Create default admin account
async function createDefaultAdmin() {
  const userRepository = AppDataSource.getRepository(User);
  const adminEmail = 'admin@qrcreator.com';
  const adminPassword = 'adminpassword';

  const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const now = new Date();
    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      name: 'System Admin',
      role: 'admin',
      trialStartDate: now,
      trialEndDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      isActive: true,
      hasActiveSubscription: true
    });
    await userRepository.save(admin);
    console.log('Default admin account created:', adminEmail, '/', adminPassword);
  } else {
    console.log('Default admin account already exists');
  }
}

// Initialize database connection
AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');
    await createDefaultAdmin();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  }); 