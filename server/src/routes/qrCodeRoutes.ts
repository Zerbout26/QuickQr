
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

// Public route for QR code redirection
router.get('/public/:id', getPublicQRCode);

// Protected routes requiring authentication
router.use(auth);
router.post('/', createQRCode);
router.get('/', getQRCodes);
router.get('/:id', getQRCode);
router.patch('/:id', updateQRCode);
router.delete('/:id', deleteQRCode);

export default router;
