import { Router } from 'express';
import {
  createQRCode,
  getQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode,
  uploadItemImageHandler
} from '../controllers/qrCodeController';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth); // All QR code routes require authentication

router.post('/', createQRCode);
router.get('/', getQRCodes);
router.get('/:id', getQRCode);
router.put('/:id', updateQRCode);
router.delete('/:id', deleteQRCode);
router.post('/upload/item-image', uploadItemImageHandler);

export default router; 