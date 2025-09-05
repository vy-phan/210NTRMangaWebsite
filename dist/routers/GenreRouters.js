"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GenreControllers_1 = require("../controllers/GenreControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', GenreControllers_1.getAllGenres);
router.get("/count", auth_1.protectRoute, auth_1.adminOnly, GenreControllers_1.getLengthGenres);
router.get('/:slug', GenreControllers_1.getGenreBySlug);
router.post('/', auth_1.protectRoute, auth_1.adminOnly, GenreControllers_1.createGenre);
router.put('/:id', auth_1.protectRoute, auth_1.adminOnly, GenreControllers_1.updateGenre);
router.delete('/:id', auth_1.protectRoute, auth_1.adminOnly, GenreControllers_1.deleteGenre);
exports.default = router;
//# sourceMappingURL=GenreRouters.js.map