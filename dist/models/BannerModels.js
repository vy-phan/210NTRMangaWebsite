"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bannerSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    bannerImg: {
        type: String,
        required: true
    },
    charImg: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
const Banner = mongoose_1.default.model("Banner", bannerSchema);
exports.default = Banner;
//# sourceMappingURL=BannerModels.js.map