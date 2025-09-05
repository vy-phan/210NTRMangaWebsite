"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
// Lưu file vào bộ nhớ tạm (RAM) dưới dạng Buffer
const storage = multer_1.default.memoryStorage();
exports.uploadMiddleware = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn mỗi file là 10MB
    }
}).array('images', 50); // Cho phép tối đa 50 files
//# sourceMappingURL=upload.js.map