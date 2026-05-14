"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    supabaseId: {
        type: String,
        // Bỏ required và unique vì chuyển sang Auth thuần, không dùng Supabase nữa
    },
    password: {
        type: String,
        // required: true sẽ gây lỗi cho 2 user cũ, nên để optional hoặc tự add password cho họ sau đó set lại required
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    avatarUrl: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
}, { timestamps: true });
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=UserModels.js.map