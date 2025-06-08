import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController';
import { adminAuth } from '../middleware/auth';

const router = Router();

// Admin routes
router.get('/users', adminAuth, getAllUsers);

export default router; 