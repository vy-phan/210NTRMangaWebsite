import express from 'express';
import { 
    createGenre, 
    getAllGenres, 
    getGenreBySlug, 
    updateGenre, 
    deleteGenre, 
    getLengthGenres
} from '../controllers/GenreControllers';
import { protectRoute, adminOnly } from '../middleware/auth';

const router = express.Router();

router.get('/', getAllGenres);
router.get("/count",protectRoute, adminOnly , getLengthGenres)
router.get('/:slug', getGenreBySlug);

router.post('/', protectRoute, adminOnly, createGenre);
router.put('/:id', protectRoute, adminOnly, updateGenre);
router.delete('/:id', protectRoute, adminOnly, deleteGenre);

export default router;