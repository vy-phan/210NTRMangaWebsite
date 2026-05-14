import { Request, Response } from 'express';
import { generateToken } from '../utils/generateToken';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModels';
import bcrypt from 'bcryptjs';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
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
                token: token,
            }
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Trim email và tìm kiếm không phân biệt hoa thường
    const trimmedEmail = email ? email.trim() : '';
    const user = await User.findOne({ email: { $regex: new RegExp(`^${trimmedEmail}$`, 'i') } });

    // Cần check user.password vì user cũ có thể chưa có password
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
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
                token: token,
            }
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password. If you are an old user, please contact admin to set a password.');
    }
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const getCurrentUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    if (user) {
        res.status(200).json({ success: true, data: user });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

export const getLengthUsers = asyncHandler(async (req: Request, res: Response) => {
    try {
        const userCount = await User.countDocuments();
        res.status(200).json({ success: true, data: userCount });
    } catch (error) {
        console.error("Error getting user count:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    // 1. Kiểm tra xác thực (User lấy từ middleware)
    const currentUser = req.user as any;

    if (!currentUser || !currentUser._id) {
        res.status(401).json({ success: false, message: "Unauthorized: User authentication required" });
        return;
    }

    const { displayName, avatarUrl } = req.body;

    // Object chứa các trường cần update
    const updateData: { displayName?: string; avatarUrl?: string } = {};

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
    const updatedUser = await User.findByIdAndUpdate(
        currentUser._id,
        { $set: updateData }, // Chỉ update những field có trong updateData
        {
            new: true,           // Trả về dữ liệu mới sau khi sửa
            runValidators: true, // Chạy validate của Mongoose schema
            select: '-__v'       // Bỏ field version key
        }
    );

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