import express from "express";
import { deleteManga, getLengthManga, getManga, getMangaByCategory, getMangaById, getMangaBySlug, getMangaTitleById, getRelatedMangas, postManga, updateManga, getMangaStats } from "../controllers/MangaControllers";
import { adminOnly, protectRoute } from "../middleware/auth";


const router = express.Router()


router.get('/', getManga);
router.get("/count", protectRoute, adminOnly, getLengthManga);
router.get("/stats", protectRoute, adminOnly, getMangaStats);
router.get("/slug/:slug", getMangaBySlug);
router.post('/related', getRelatedMangas);
router.get('/category/:category', getMangaByCategory);
router.get('/:id/title', getMangaTitleById);
router.get("/:id", getMangaById);

router.post('/', protectRoute, adminOnly, postManga)
router.delete('/:id', protectRoute, adminOnly, deleteManga)
router.put('/:id', protectRoute, adminOnly, updateManga)

export default router

