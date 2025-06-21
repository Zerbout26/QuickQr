import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { QRCode } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';
import { ILike } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);
const qrCodeRepository = AppDataSource.getRepository(QRCode);

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.searchTerm as string || '';

    let whereCondition = {};
    if (searchTerm) {
      whereCondition = [
        { email: ILike(`%${searchTerm}%`) },
        { phone: ILike(`%${searchTerm}%`) },
        { name: ILike(`%${searchTerm}%`) },
      ];
    }

    const [users, total] = await userRepository.findAndCount({
      where: whereCondition,
      relations: ['qrCodes'],
      order: {
        createdAt: 'DESC'
      },
      take: limit,
      skip: skip,
    });

    // Calculate total visits for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const totalScansResult = await qrCodeRepository
        .createQueryBuilder('qr')
        .select('SUM(qr.scanCount)', 'total')
        .where('qr.user.id = :userId', { userId: user.id })
        .getRawOne();
      
      const totalQRCodes = user.qrCodes.length;
      const totalScans = parseInt(totalScansResult?.total || '0', 10);

      // We don't want to send the full qrCodes array
      const { qrCodes, ...userWithoutQRCodes } = user;

      return {
        ...userWithoutQRCodes,
        totalQRCodes,
        totalScans
      };
    }));

    res.json({
      data: usersWithStats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
}; 