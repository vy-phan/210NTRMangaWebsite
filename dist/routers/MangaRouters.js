"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MangaControllers_1 = require("../controllers/MangaControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', MangaControllers_1.getManga);
router.get("/count", auth_1.protectRoute, auth_1.adminOnly, MangaControllers_1.getLengthManga);
router.get("/stats", auth_1.protectRoute, auth_1.adminOnly, MangaControllers_1.getMangaStats);
router.get("/genre-stats", MangaControllers_1.getGenreStats);
router.get("/slug/:slug", MangaControllers_1.getMangaBySlug);
router.post('/related', MangaControllers_1.getRelatedMangas);
router.get('/category/:category', MangaControllers_1.getMangaByCategory);
router.get('/:id/title', MangaControllers_1.getMangaTitleById);
router.get("/:id", MangaControllers_1.getMangaById);
router.post('/', auth_1.protectRoute, auth_1.adminOnly, MangaControllers_1.postManga);
router.delete('/:id', auth_1.protectRoute, auth_1.adminOnly, MangaControllers_1.deleteManga);
router.put('/:id', auth_1.protectRoute, auth_1.adminOnly, MangaControllers_1.updateManga);
exports.default = router;
//# sourceMappingURL=MangaRouters.js.map