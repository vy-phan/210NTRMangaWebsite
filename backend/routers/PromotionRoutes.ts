import express from "express";
import { 
    getPromotions, 
    getPromotionById, 
    createPromotion, 
    updatePromotion, 
    deletePromotion 
} from "../controllers/PromotionControllers";
import { adminOnly, protectRoute } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/", getPromotions);

// Protected Admin routes
router.get("/:id", protectRoute, adminOnly, getPromotionById);
router.post("/", protectRoute, adminOnly, createPromotion);
router.put("/:id", protectRoute, adminOnly, updatePromotion);
router.delete("/:id", protectRoute, adminOnly, deletePromotion);

export default router;
