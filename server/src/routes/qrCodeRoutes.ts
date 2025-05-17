import { Router } from 'express';
import {
  createQRCode,
  getQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode,
  redirectToUrl
} from '../controllers/qrCodeController';
import { auth } from '../middleware/auth';

const router = Router();

// Public route for QR code redirects - must be before auth middleware
router.get('/redirect/:id', redirectToUrl);

// Protected routes
router.use(auth);
router.post('/', createQRCode);
router.get('/', getQRCodes);
router.get('/:id', getQRCode);
router.patch('/:id', updateQRCode);
router.delete('/:id', deleteQRCode);

export default router; 