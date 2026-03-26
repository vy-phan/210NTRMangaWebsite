import express from "express";
import { 
    getActiveNotification, 
    getAllNotifications, 
    createNotification, 
    updateNotification, 
    deleteNotification 
} from "../controllers/NotificationControllers";
import { adminOnly, protectRoute } from "../middleware/auth";

const router = express.Router();

// Public route: Get the latest active notification
router.get("/active", getActiveNotification);

// Admin routes
router.get("/", protectRoute, adminOnly, getAllNotifications);
router.post("/", protectRoute, adminOnly, createNotification);
router.put("/:id", protectRoute, adminOnly, updateNotification);
router.delete("/:id", protectRoute, adminOnly, deleteNotification);

export default router;
