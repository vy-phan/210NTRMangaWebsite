"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ChapterReportControllers_1 = require("../controllers/ChapterReportControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Route người dùng công khai
router.post('/', ChapterReportControllers_1.createReport);
// Route Admin quản lý nội bộ
router.get('/', auth_1.protectRoute, auth_1.adminOnly, ChapterReportControllers_1.getAllReports);
router.patch('/:id', auth_1.protectRoute, auth_1.adminOnly, ChapterReportControllers_1.updateReportStatus);
router.delete('/:id', auth_1.protectRoute, auth_1.adminOnly, ChapterReportControllers_1.deleteReport);
exports.default = router;
//# sourceMappingURL=ChapterReportRouters.js.map