import { Router } from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrderStatus, 
  updateOrderNotes, 
  deleteOrder, 
  getOrderStats 
} from '../controllers/orderController';
import { auth } from '../middleware/auth';

const router = Router();

// Public route for creating orders
router.post('/', createOrder);

// Protected routes for admin order management
router.get('/', auth, getOrders);
router.get('/stats', auth, getOrderStats);
router.get('/:id', auth, getOrder);
router.patch('/:id/status', auth, updateOrderStatus);
router.patch('/:id/notes', auth, updateOrderNotes);
router.delete('/:id', auth, deleteOrder);

export default router; 