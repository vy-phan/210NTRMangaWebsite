"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLengthUsers = exports.getCurrentUserProfile = exports.syncUserProfile = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const UserModels_1 = __importDefault(require("../models/UserModels"));
const supabase_1 = require("../config/supabase");
exports.syncUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    // 1. Kiểm tra sự tồn tại của header `Authorization`
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error("Authorization token is missing or malformed");
    }
    // 2. Chỉ tách token khi đã chắc chắn header tồn tại và đúng định dạng
    const token = authHeader.split(' ')[1];
    // 3. Xác thực token với Supabase
    const { data: { user: supabaseUser }, error } = await supabase_1.supabase.auth.getUser(token);
    if (error || !supabaseUser) {
        res.status(401);
        throw new Error("Invalid Supabase user or token");
    }
    // 4. Logic còn lại không thay đổi
    const { id: supabaseId, email, user_metadata, app_metadata } = supabaseUser;
    const displayName = user_metadata.full_name || user_metadata.user_name || 'Anonymous';
    const avatarUrl = user_metadata.avatar_url || '';
    const provider = app_metadata.provider;
    const user = await UserModels_1.default.findOneAndUpdate({ supabaseId: supabaseId }, {
        $set: {
            email: email,
            displayName: displayName,
            avatarUrl: avatarUrl,
            providers: provider,
        },
        $setOnInsert: {
            supabaseId: supabaseId,
            role: 'user',
        }
    }, {
        new: true,
        upsert: true,
        select: '-__v'
    });
    res.status(200).json({ success: true, data: user });
});
exports.getCurrentUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const user = req.user;
    if (user) {
        res.status(200).json({ success: true, data: user });
    }
    else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});
exports.getLengthUsers = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const userCount = await UserModels_1.default.countDocuments();
        res.status(200).json({ success: true, data: userCount });
    }
    catch (error) {
        console.error("Error getting user count:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
//# sourceMappingURL=UserControllers.js.map