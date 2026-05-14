import express from 'express';
import { registerUser, loginUser, logoutUser, getCurrentUserProfile, getLengthUsers, updateUserProfile } from '../controllers/UserControllers';
import { adminOnly, protectRoute } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protectRoute, getCurrentUserProfile);
router.put('/edit-me', protectRoute, updateUserProfile);
router.get('/count',protectRoute, adminOnly, getLengthUsers);

export default router;