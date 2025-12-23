import express from "express";
import { 
    createBanner, 
    deleteBanner, 
    getAllBannersAdmin, 
    getBannerById, 
    getBanners, 
    updateBanner 
} from "../controllers/BannerController";
import { adminOnly, protectRoute } from "../middleware/auth";

const router = express.Router();


router.get('/', getBanners);

router.get('/admin/all', protectRoute, adminOnly, getAllBannersAdmin); 
router.get('/:id', protectRoute, adminOnly, getBannerById); 
router.post('/', protectRoute, adminOnly, createBanner); 
router.put('/:id', protectRoute, adminOnly, updateBanner); 
router.delete('/:id', protectRoute, adminOnly, deleteBanner); 

export default router;