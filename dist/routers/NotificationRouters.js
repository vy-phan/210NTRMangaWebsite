"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NotificationControllers_1 = require("../controllers/NotificationControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public route: Get the latest active notification
router.get("/active", NotificationControllers_1.getActiveNotification);
// Admin routes
router.get("/", auth_1.protectRoute, auth_1.adminOnly, NotificationControllers_1.getAllNotifications);
router.post("/", auth_1.protectRoute, auth_1.adminOnly, NotificationControllers_1.createNotification);
router.put("/:id", auth_1.protectRoute, auth_1.adminOnly, NotificationControllers_1.updateNotification);
router.delete("/:id", auth_1.protectRoute, auth_1.adminOnly, NotificationControllers_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=NotificationRouters.js.map