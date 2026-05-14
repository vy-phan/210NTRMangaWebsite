"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PromotionControllers_1 = require("../controllers/PromotionControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get("/", PromotionControllers_1.getPromotions);
// Protected Admin routes
router.get("/:id", auth_1.protectRoute, auth_1.adminOnly, PromotionControllers_1.getPromotionById);
router.post("/", auth_1.protectRoute, auth_1.adminOnly, PromotionControllers_1.createPromotion);
router.put("/:id", auth_1.protectRoute, auth_1.adminOnly, PromotionControllers_1.updatePromotion);
router.delete("/:id", auth_1.protectRoute, auth_1.adminOnly, PromotionControllers_1.deletePromotion);
exports.default = router;
//# sourceMappingURL=PromotionRoutes.js.map