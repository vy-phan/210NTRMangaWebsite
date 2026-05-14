"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getLengthUsers = exports.getCurrentUserProfile = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const UserModels_1 = __importDefault(require("../models/UserModels"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};
exports.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
        res.status(400);
        throw new Error('Please add all fields');
    }
    const userExists = await UserModels_1.default.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    const user = await UserModels_1.default.create({
        displayName,
        email,
        password: hashedPassword,
        role: 'user',
    });
    if (user) {
        const token = generateToken(user._id.toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        res.status(201).json({
            success: true,
            data: {
                _id: user.id,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            }
        });
    }
    else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});
exports.loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModels_1.default.findOne({ email });
    // Cần check user.password vì user cũ có thể chưa có password
    if (user && user.password && (await bcryptjs_1.default.compare(password, user.password))) {
        const token = generateToken(user._id.toString());
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.json({
            success: true,
            data: {
                _id: user.id,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            }
        });
    }
    else {
        res.status(401);
        throw new Error('Invalid email or password. If you are an old user, please contact admin to set a password.');
    }
});
exports.logoutUser = (0, express_async_handler_1.default)(async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
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
exports.updateUserProfile = (0, express_async_handler_1.default)(async (req, res) => {
    // 1. Kiểm tra xác thực (User lấy từ middleware)
    const currentUser = req.user;
    if (!currentUser || !currentUser._id) {
        res.status(401).json({ success: false, message: "Unauthorized: User authentication required" });
        return;
    }
    const { displayName, avatarUrl } = req.body;
    // Object chứa các trường cần update
    const updateData = {};
    // 2. Logic xử lý riêng cho DisplayName
    // Chỉ xử lý khi client có gửi field này lên (khác undefined)
    if (displayName !== undefined) {
        if (typeof displayName !== 'string' || displayName.trim() === '') {
            res.status(400).json({ success: false, message: "Display name must be a non-empty string" });
            return;
        }
        updateData.displayName = displayName.trim();
    }
    // 3. Logic xử lý riêng cho AvatarUrl
    // Chỉ xử lý khi client có gửi field này lên (khác undefined)
    if (avatarUrl !== undefined) {
        if (typeof avatarUrl !== 'string') {
            res.status(400).json({ success: false, message: "Avatar URL must be a valid string" });
            return;
        }
        updateData.avatarUrl = avatarUrl;
    }
    // 4. Kiểm tra xem có gì để update không
    // Nếu client gửi body rỗng {} hoặc gửi các field không hợp lệ -> Báo lỗi
    if (Object.keys(updateData).length === 0) {
        res.status(400).json({
            success: false,
            message: "No valid fields provided. Please provide 'displayName' or 'avatarUrl'"
        });
        return;
    }
    // 5. Thực hiện Update vào Database
    const updatedUser = await UserModels_1.default.findByIdAndUpdate(currentUser._id, { $set: updateData }, // Chỉ update những field có trong updateData
    {
        new: true, // Trả về dữ liệu mới sau khi sửa
        runValidators: true, // Chạy validate của Mongoose schema
        select: '-__v' // Bỏ field version key
    });
    if (!updatedUser) {
        res.status(404).json({ success: false, message: "User not found in database" });
        return;
    }
    // 6. Trả về kết quả thành công
    res.status(200).json({
        success: true,
        data: updatedUser
    });
});
//# sourceMappingURL=UserControllers.js.map