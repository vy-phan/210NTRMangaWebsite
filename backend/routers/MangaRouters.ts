import express from "express";
import { deleteManga, getLengthManga, getManga, getMangaById, getMangaBySlug, getMangaTitleById, postManga, updateManga } from "../controllers/MangaControllers";
import { adminOnly, protectRoute } from "../middleware/auth";


const router = express.Router()


router.get('/', getManga);
router.get("/count",protectRoute, adminOnly,getLengthManga)
router.get("/slug/:slug", getMangaBySlug);
router.get('/:id/title', getMangaTitleById);
router.get("/:id", getMangaById);

router.post('/',protectRoute,adminOnly,postManga)
router.delete('/:id',protectRoute,adminOnly,deleteManga)
router.put('/:id',protectRoute,adminOnly,updateManga)

export default router

