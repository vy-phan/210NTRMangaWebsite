import express from 'express';
import { uploadMiddleware } from '../middleware/upload';
import { deleteImage, getImagesByMangaName, uploadImages } from '../controllers/ImageUploadControllers';
import { adminOnly, protectRoute } from '../middleware/auth';

const router = express.Router();

router.post('/upload',protectRoute,adminOnly,uploadMiddleware, uploadImages);
router.get('/manga/:mangaName',protectRoute, adminOnly, getImagesByMangaName);
router.delete('/:id',protectRoute,adminOnly,deleteImage);

export default router;