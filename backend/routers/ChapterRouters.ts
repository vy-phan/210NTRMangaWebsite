import express from 'express';
import { 
    getChaptersByMangaId,
    getChapterById,
    createChapter,
    updateChapter,
    deleteChapter,
    getChapterByMangaAndNumber
} from '../controllers/ChapterControllers';
import { protectRoute, adminOnly } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/manga/:mangaId', getChaptersByMangaId);
router.get('/:mangaSlug/:chapterNumber', getChapterByMangaAndNumber);
router.get('/:id', getChapterById);

// Admin routes
router.post('/', protectRoute, adminOnly, createChapter);
router.put('/:id', protectRoute, adminOnly, updateChapter);
router.delete('/:id', protectRoute, adminOnly, deleteChapter);

export default router;