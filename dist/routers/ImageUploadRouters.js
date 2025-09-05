"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = require("../middleware/upload");
const ImageUploadControllers_1 = require("../controllers/ImageUploadControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/upload', auth_1.protectRoute, auth_1.adminOnly, upload_1.uploadMiddleware, ImageUploadControllers_1.uploadImages);
router.get('/manga/:mangaName', auth_1.protectRoute, auth_1.adminOnly, ImageUploadControllers_1.getImagesByMangaName);
router.delete('/:id', auth_1.protectRoute, auth_1.adminOnly, ImageUploadControllers_1.deleteImage);
exports.default = router;
//# sourceMappingURL=ImageUploadRouters.js.map