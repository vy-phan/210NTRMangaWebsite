import express from 'express';
import { syncUserProfile, getCurrentUserProfile, getLengthUsers } from '../controllers/UserControllers';
import { adminOnly, protectRoute } from '../middleware/auth';

const router = express.Router();

router.post('/sync', syncUserProfile);
router.get('/me', protectRoute, getCurrentUserProfile);
router.get('/count',protectRoute, adminOnly, getLengthUsers);

export default router;