"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protectRoute = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const supabase_1 = require("../config/supabase");
const UserModels_1 = __importDefault(require("../models/UserModels"));
exports.protectRoute = (0, express_async_handler_1.default)(async (req, res, next) => {
    let token;
    // 1. Lấy token từ header 'Authorization'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // 2. Xác thực token với Supabase
            const { data: { user: supabaseUser }, error } = await supabase_1.supabase.auth.getUser(token);
            if (error || !supabaseUser) {
                res.status(401);
                throw new Error('Not authorized, token failed');
            }
            // 3. Token hợp lệ, tìm user profile tương ứng trong MongoDB
            // Chúng ta sẽ dùng supabaseId đã lưu để tìm kiếm
            const userProfile = await UserModels_1.default.findOne({ supabaseId: supabaseUser.id }).select('-__v'); // select('-__v') để bỏ trường __v
            if (!userProfile) {
                // Trường hợp này hiếm khi xảy ra nếu luồng sync hoạt động tốt
                // Nhưng vẫn cần xử lý để đảm bảo an toàn
                res.status(404);
                throw new Error('User profile not found in our database. Please sync your account.');
            }
            // 4. Gán user profile từ MongoDB vào request để các controller sau có thể sử dụng
            req.user = userProfile;
            next(); // Cho phép đi tiếp
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