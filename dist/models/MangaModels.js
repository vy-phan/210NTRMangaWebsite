"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mangaSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['Ongoing', 'Completed', 'Cancelled'],
    },
    genres: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Genre',
            index: true
        }
    ],
    poster: {
        type: String
    },
}, { timestamps: true });
const Manga = mongoose_1.default.model('Manga', mangaSchema);
exports.default = Manga;
//# sourceMappingURL=MangaModels.js.map