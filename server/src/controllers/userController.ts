import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { AuthRequest, generateAuthToken } from '../middleware/auth';

const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate trial dates
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

    // Create new user
    const user = userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone,
      trialStartDate,
      trialEndDate,
      role: 'user',
      isActive: true,
      hasActiveSubscription: false
    });

    await userRepository.save(user);

    // Generate token using our new function
    const token = generateAuthToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token using our new function
    const token = generateAuthToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, email } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (email) user.email = email;

    await userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const users = await userRepository.find({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        trialStartDate: true,
        trialEndDate: true,
        isActive: true,
        hasActiveSubscription: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = isActive;
    await userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user status' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await userRepository.findOne({ where: { email } });
    
    // Return whether the email exists
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying email' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Simple validation
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Find user by email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedPassword;
    await userRepository.save(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ message: 'Password updated successfully', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Error updating password' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if the email exists or not for security
      return res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
    }

    // In a real application, you would:
    // 1. Generate a secure reset token
    // 2. Save the token with an expiration time
    // 3. Send an email with a reset link
    // For now, we'll just return a success message
    res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
  } catch (error) {
    res.status(500).json({ error: 'Error processing password reset request' });
  }
};
