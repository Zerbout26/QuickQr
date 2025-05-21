import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Set token expiration to 7 days
const TOKEN_EXPIRATION = '7d';

export interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No authentication token provided');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; exp: number };
      
      // Check if token is about to expire (less than 1 day remaining)
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;
      const oneDayInSeconds = 24 * 60 * 60;
      
      // Store the token for potential refresh
      req.token = token;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        throw new Error('User not found');
      }

      // Remove the isActive check to allow dashboard access
      req.user = user;
      
      // If token is about to expire, include a refresh token in the response
      if (timeUntilExpiry < oneDayInSeconds) {
        const newToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
        res.setHeader('X-Auth-Token', newToken);
      }
      
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired', 
          code: 'TOKEN_EXPIRED' 
        });
      }
      throw error;
    }
  } catch (error: any) {
    res.status(401).json({ 
      error: error.message || 'Please authenticate.',
      code: 'AUTH_REQUIRED' 
    });
  }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await auth(req, res, () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.', code: 'ADMIN_REQUIRED' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.', code: 'AUTH_REQUIRED' });
  }
};

// New function to generate a token
export const generateAuthToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};
