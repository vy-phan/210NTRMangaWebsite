"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BannerController_1 = require("../controllers/BannerController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', BannerController_1.getBanners);
router.get('/admin/all', auth_1.protectRoute, auth_1.adminOnly, BannerController_1.getAllBannersAdmin);
router.get('/:id', auth_1.protectRoute, auth_1.adminOnly, BannerController_1.getBannerById);
router.post('/', auth_1.protectRoute, auth_1.adminOnly, BannerController_1.createBanner);
router.put('/:id', auth_1.protectRoute, auth_1.adminOnly, BannerController_1.updateBanner);
router.delete('/:id', auth_1.protectRoute, auth_1.adminOnly, BannerController_1.deleteBanner);
exports.default = router;
//# sourceMappingURL=BannerRoutes.js.map