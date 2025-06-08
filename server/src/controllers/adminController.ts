import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { QRCode } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';

const userRepository = AppDataSource.getRepository(User);
const qrCodeRepository = AppDataSource.getRepository(QRCode);

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const users = await userRepository.find({
      relations: ['qrCodes'],
      order: {
        createdAt: 'DESC'
      }
    });

    // Calculate total visits for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const totalVisits = await qrCodeRepository
        .createQueryBuilder('qr')
        .select('SUM(qr.scanCount)', 'total')
        .where('qr.user.id = :userId', { userId: user.id })
        .getRawOne();

      return {
        ...user,
        totalVisits: parseInt(totalVisits?.total || '0', 10)
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
}; 