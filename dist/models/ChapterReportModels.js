"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chapterReportSchema = new mongoose_1.default.Schema({
    mangaId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Manga',
        required: true,
        index: true
    },
    chapterId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Chapter',
        required: true,
        index: true
    },
    reporter: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Để trống nếu là khách, hoặc bắt buộc nếu yêu cầu đăng nhập
    },
    errorType: {
        type: String,
        required: true,
        enum: ['image_broken', 'wrong_order', 'missing_pages', 'wrong_manga', 'other'],
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'fixed', 'rejected'],
        default: 'pending'
    },
    // Lưu IP để chống spam
    ipAddress: {
        type: String,
        required: false
    }
}, { timestamps: true });
const ChapterReport = mongoose_1.default.model('ChapterReport', chapterReportSchema);
exports.default = ChapterReport;
//# sourceMappingURL=ChapterReportModels.js.map