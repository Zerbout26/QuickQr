import { Router } from 'express';
import { getLandingPage } from '../controllers/landingController';

const router = Router();

// Public route for the landing page
router.get('/:id', getLandingPage);

export default router; 