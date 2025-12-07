import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModels';
import { supabase } from '../config/supabase';

export const syncUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error("Authorization token is missing or malformed");
    }

    const token = authHeader.split(' ')[1];

    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
        res.status(401);
        throw new Error("Invalid Supabase user or token");
    }

    const { id: supabaseId, email, user_metadata, app_metadata } = supabaseUser;

    const displayName = user_metadata.full_name || user_metadata.user_name || 'Anonymous';
    const avatarUrl = user_metadata.avatar_url || '';
    const provider = app_metadata.provider;

    const user = await User.findOneAndUpdate(
        { supabaseId: supabaseId },
        {
            // $set: Chỉ cập nhật những trường cần đồng bộ liên tục (như Email, Provider)
            // Nếu user đăng nhập lại, ta KHÔNG muốn ghi đè tên/ảnh custom của họ
            $set: {
                email: email,
                providers: provider,
            },
            
            // $setOnInsert: Chỉ chạy KHI TẠO MỚI user lần đầu tiên
            // Lúc này mới lấy tên/ảnh từ Google/Discord làm mặc định
            $setOnInsert: {
                supabaseId: supabaseId,
                role: 'user',
                displayName: displayName, 
                avatarUrl: avatarUrl,     
            }
        },
        {
            new: true,
            upsert: true,
            select: '-__v'
        }
    );

    res.status(200).json({ success: true, data: user });
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