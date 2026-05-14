"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ImageSchema = new mongoose_1.default.Schema({
    secure_url: {
        type: String,
        required: true,
        unique: true,
    },
    public_id: {
        type: String,
        required: true,
        unique: true,
    },
    folder: {
        type: String,
        required: true,
        index: true,
    },
    mangaName: {
        type: String,
    },
    chapter: {
        type: String, // Có thể có hoặc không
    }
}, { timestamps: true });
const ImageUpload = mongoose_1.default.model('ImageUpload', ImageSchema);
exports.default = ImageUpload;
//# sourceMappingURL=ImageUploadModel.js.map