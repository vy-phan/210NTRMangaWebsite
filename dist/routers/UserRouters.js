"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserControllers_1 = require("../controllers/UserControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/sync', UserControllers_1.syncUserProfile);
router.get('/me', auth_1.protectRoute, UserControllers_1.getCurrentUserProfile);
router.get('/count', auth_1.protectRoute, auth_1.adminOnly, UserControllers_1.getLengthUsers);
exports.default = router;
//# sourceMappingURL=UserRouters.js.map