
import { Router } from 'express';
import {
  createQRCode,
  getQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode,
  getPublicQRCode
} from '../controllers/qrCodeController';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes - NO authentication required
// Must be defined BEFORE any middleware that would apply to all routes
router.get('/public/:id', getPublicQRCode);

// All routes below this middleware will require authentication
router.use(auth);

// Protected routes requiring authentication
router.post('/', createQRCode);
router.get('/', getQRCodes);
router.get('/:id', getQRCode);
router.patch('/:id', updateQRCode);
router.delete('/:id', deleteQRCode);

export default router;
