"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protectRoute = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserModels_1 = __importDefault(require("../models/UserModels"));
exports.protectRoute = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token;
    // 1. Lấy token từ cookie
    if (req.cookies && req.cookies.token) {
        try {
            token = req.cookies.token;
            // 2. Xác thực token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
            // 3. Token hợp lệ, tìm user profile
            const userProfile = await UserModels_1.default.findById(decoded.id).select('-password -__v');
            if (!userProfile) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            // 4. Gán user
            req.user = userProfile;
            next();
        }
        catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});
// (Tùy chọn) Middleware kiểm tra quyền Admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};
exports.adminOnly = adminOnly;
//# sourceMappingURL=auth.js.map