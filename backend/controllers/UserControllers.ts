import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/UserModels';
import { supabase } from '../config/supabase';

export const syncUserProfile = asyncHandler(async (req: Request, res: Response) => {
    // 1. Kiểm tra sự tồn tại của header `Authorization`
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error("Authorization token is missing or malformed");
    }

    // 2. Chỉ tách token khi đã chắc chắn header tồn tại và đúng định dạng
    const token = authHeader.split(' ')[1];

    // 3. Xác thực token với Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
        res.status(401);
        throw new Error("Invalid Supabase user or token");
    }

    // 4. Logic còn lại không thay đổi
    const { id: supabaseId, email, user_metadata, app_metadata } = supabaseUser;

    const displayName = user_metadata.full_name || user_metadata.user_name || 'Anonymous';
    const avatarUrl = user_metadata.avatar_url || '';
    const provider = app_metadata.provider;

    const user = await User.findOneAndUpdate(
        { supabaseId: supabaseId },
        {
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
