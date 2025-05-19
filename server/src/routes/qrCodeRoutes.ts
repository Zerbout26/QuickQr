
import { Router } from 'express';
import {
  createQRCode,
  getQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode,
  uploadItemImageHandler,
  getPublicQRCode
} from '../controllers/qrCodeController';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/public/:id', getPublicQRCode);

// Protected routes (authentication required)
router.use(auth); 
router.post('/', createQRCode);
router.get('/', getQRCodes);
router.get('/:id', getQRCode);
router.put('/:id', updateQRCode);
router.delete('/:id', deleteQRCode);
router.post('/upload/item-image', uploadItemImageHandler);

export default router;
