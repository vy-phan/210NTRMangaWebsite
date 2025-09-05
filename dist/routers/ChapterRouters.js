"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ChapterControllers_1 = require("../controllers/ChapterControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.get('/manga/:mangaId', ChapterControllers_1.getChaptersByMangaId);
router.get('/:mangaSlug/:chapterNumber', ChapterControllers_1.getChapterByMangaAndNumber);
router.get('/:id', ChapterControllers_1.getChapterById);
// Admin routes
router.post('/', auth_1.protectRoute, auth_1.adminOnly, ChapterControllers_1.createChapter);
router.put('/:id', auth_1.protectRoute, auth_1.adminOnly, ChapterControllers_1.updateChapter);
router.delete('/:id', auth_1.protectRoute, auth_1.adminOnly, ChapterControllers_1.deleteChapter);
exports.default = router;
//# sourceMappingURL=ChapterRouters.js.map