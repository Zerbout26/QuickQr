import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

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
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

createAdmin(); 