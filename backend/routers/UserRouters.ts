import express from 'express';
import { syncUserProfile, getCurrentUserProfile, getLengthUsers, updateUserProfile } from '../controllers/UserControllers';
import { adminOnly, protectRoute } from '../middleware/auth';

const router = express.Router();

router.post('/sync', syncUserProfile);
router.get('/me', protectRoute, getCurrentUserProfile);
router.put('/edit-me', protectRoute, updateUserProfile);
router.get('/count',protectRoute, adminOnly, getLengthUsers);

export default router;