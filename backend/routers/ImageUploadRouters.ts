import express from 'express';
import { uploadMiddleware } from '../middleware/upload';
import { deleteImage, getImagesByMangaName, uploadImages, deleteImagesByChapter, deleteImagesByManga } from '../controllers/ImageUploadControllers';
import { getStorageSyncStatus, deleteOrphanFolder, deleteDbOnlyRecords } from '../controllers/StorageSyncControllers';
import { adminOnly, protectRoute } from '../middleware/auth';

const router = express.Router();

router.post('/upload', protectRoute, adminOnly, uploadMiddleware, uploadImages);
router.get('/manga/:mangaName', protectRoute, adminOnly, getImagesByMangaName);
router.delete('/:id', protectRoute, adminOnly, deleteImage);
router.post('/delete-chapter', protectRoute, adminOnly, deleteImagesByChapter);
router.post('/delete-manga', protectRoute, adminOnly, deleteImagesByManga);

// ─── Storage Sync routes ───
router.get('/sync-status', protectRoute, adminOnly, getStorageSyncStatus);
router.delete('/sync/orphan/:slug', protectRoute, adminOnly, deleteOrphanFolder);
router.delete('/sync/db-only/:mangaName', protectRoute, adminOnly, deleteDbOnlyRecords);

export default router;