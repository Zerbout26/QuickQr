import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { QRCode } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';
import { ILike } from 'typeorm';
import { deleteFromCloudinary } from '../config/cloudinary';

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

    // Calculate total visits for each users
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

export const getUserQRCodes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    // Verify the user exists
    const user = await userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get QR codes for the specific user
    const [qrCodes, total] = await qrCodeRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    res.json({
      data: qrCodes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching user QR codes:', error);
    res.status(500).json({ error: 'Error fetching user QR codes' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { userId } = req.params;

    // Verify the user exists
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['qrCodes']
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      res.status(400).json({ error: 'Cannot delete admin accounts' });
      return;
    }

    // Delete QR codes and their associated files
    if (user.qrCodes && user.qrCodes.length > 0) {
      for (const qrCode of user.qrCodes) {
        try {
          // Delete logo from Cloudinary if exists
          if (qrCode.logoUrl) {
            const publicId = qrCode.logoUrl.split('/').pop()?.split('.')[0];
            if (publicId) {
              await deleteFromCloudinary(publicId);
            }
          }

          // Delete menu item images from Cloudinary if exists
          if (qrCode.menu) {
            const menuData = typeof qrCode.menu === 'string' ? JSON.parse(qrCode.menu) : qrCode.menu;
            if (menuData.categories) {
              for (const category of menuData.categories) {
                if (category.items) {
                  for (const item of category.items) {
                    if (item.images && Array.isArray(item.images)) {
                      for (const imageUrl of item.images) {
                        const publicId = imageUrl.split('/').pop()?.split('.')[0];
                        if (publicId) {
                          await deleteFromCloudinary(publicId);
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          // Delete product images from Cloudinary if exists
          if (qrCode.products) {
            const productsData = typeof qrCode.products === 'string' ? JSON.parse(qrCode.products) : qrCode.products;
            if (productsData.products) {
              for (const product of productsData.products) {
                if (product.images && Array.isArray(product.images)) {
                  for (const imageUrl of product.images) {
                    const publicId = imageUrl.split('/').pop()?.split('.')[0];
                    if (publicId) {
                      await deleteFromCloudinary(publicId);
                    }
                  }
                }
              }
            }
          }

          // Delete vitrine images from Cloudinary if exists
          if (qrCode.vitrine) {
            const vitrineData = typeof qrCode.vitrine === 'string' ? JSON.parse(qrCode.vitrine) : qrCode.vitrine;
            if (vitrineData.services) {
              for (const service of vitrineData.services) {
                if (service.imageUrl) {
                  const publicId = service.imageUrl.split('/').pop()?.split('.')[0];
                  if (publicId) {
                    await deleteFromCloudinary(publicId);
                  }
                }
              }
            }
            if (vitrineData.gallery) {
              for (const galleryItem of vitrineData.gallery) {
                if (galleryItem.imageUrl) {
                  const publicId = galleryItem.imageUrl.split('/').pop()?.split('.')[0];
                  if (publicId) {
                    await deleteFromCloudinary(publicId);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error cleaning up QR code ${qrCode.id}:`, error);
          // Continue with deletion even if cleanup fails
        }
      }
    }

    // Delete the user (this will cascade delete QR codes due to foreign key constraints)
    await userRepository.remove(user);

    res.json({ 
      message: 'User and all associated QR codes deleted successfully',
      deletedUser: {
        id: user.id,
        email: user.email,
        qrCodesCount: user.qrCodes?.length || 0
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
}; 