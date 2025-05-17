import { Router } from 'express';
import { register, login, getProfile, updateProfile, getAllUsers, updateUserStatus } from '../controllers/userController';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);

// Admin routes
router.get('/admin/users', auth, getAllUsers);
router.patch('/admin/users/:userId/status', auth, updateUserStatus);

export default router; 