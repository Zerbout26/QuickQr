import { Router } from 'express';
import {
  createQRCode,
  getAllQRCodes,
  getQRCode,
  updateQRCode,
  deleteQRCode,
  uploadItemImageHandler,
  getPublicQRCode,
  redirectToUrl,
  incrementScanCount
} from '../controllers/qrCodeController';
import {
  getLandingPageColors,
  updateLandingPageColors
} from '../controllers/landingPageController';
import { auth } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/public/:id', getPublicQRCode);
router.get('/redirect/:url', redirectToUrl);
router.post('/:id/scan', incrementScanCount);
router.get('/:id/colors', getLandingPageColors);

// Protected routes (authentication required)
router.use(auth); 
router.post('/', createQRCode);
router.get('/', getAllQRCodes);
router.get('/:id', getQRCode);
router.put('/:id', updateQRCode);
router.delete('/:id', deleteQRCode);
router.post('/upload/item-image', uploadItemImageHandler);
router.put('/:id/colors', updateLandingPageColors);

export default router;
