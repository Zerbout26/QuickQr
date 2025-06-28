import { Router } from 'express';
import { getAllUsers, getUserQRCodes, deleteUser } from '../controllers/adminController';
import { adminAuth } from '../middleware/auth';

const router = Router();

// Admin routes
router.get('/users', adminAuth, getAllUsers);
router.get('/users/:userId/qrcodes', adminAuth, getUserQRCodes);
router.delete('/users/:userId', adminAuth, deleteUser);

export default router; 