"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserControllers_1 = require("../controllers/UserControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/register', UserControllers_1.registerUser);
router.post('/login', UserControllers_1.loginUser);
router.post('/logout', UserControllers_1.logoutUser);
router.get('/me', auth_1.protectRoute, UserControllers_1.getCurrentUserProfile);
router.put('/edit-me', auth_1.protectRoute, UserControllers_1.updateUserProfile);
router.get('/count', auth_1.protectRoute, auth_1.adminOnly, UserControllers_1.getLengthUsers);
exports.default = router;
//# sourceMappingURL=UserRouters.js.map