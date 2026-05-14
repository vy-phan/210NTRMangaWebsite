"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const imageSchema = new mongoose_1.default.Schema({
    url: {
        type: String,
        required: true
    },
    pageNumber: {
        type: Number,
        required: true
    }
}, { _id: false });
const chapterSchema = new mongoose_1.default.Schema({
    number: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    manga: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Manga',
        required: true,
        index: true
    },
    images: [imageSchema]
}, { timestamps: true });
chapterSchema.index({ manga: 1, number: 1 }, { unique: true });
const Chapter = mongoose_1.default.model('Chapter', chapterSchema);
exports.default = Chapter;
//# sourceMappingURL=ChapterModels.js.map