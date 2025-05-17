import { Router } from 'express';
import {
  createQRCode,
  getQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode
} from '../controllers/qrCodeController';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth); // All QR code routes require authentication

router.post('/', createQRCode);
router.get('/', getQRCodes);
router.get('/:id', getQRCode);
router.patch('/:id', updateQRCode);
router.delete('/:id', deleteQRCode);

export default router; 