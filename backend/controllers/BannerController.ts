import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Banner from '../models/BannerModels';
import mongoose from 'mongoose';

/**
 * @desc    Get all ACTIVE banners (For Frontend User)
 * @route   GET /api/banners
 * @access  Public
 */
export const getBanners = asyncHandler(async (req: Request, res: Response) => {
    // Chỉ lấy banner đang bật (active: true) và sắp xếp theo độ ưu tiên (priority cao lên đầu)
    const banners = await Banner.find({ active: true })
        .sort({ priority: -1, updatedAt: -1 });
        
    res.status(200).json({ success: true, data: banners });
});

/**
 * @desc    Get ALL banners (For Admin Dashboard)
 * @route   GET /api/banners/admin/all
 * @access  Private/Admin
 */
export const getAllBannersAdmin = asyncHandler(async (req: Request, res: Response) => {
    // Lấy tất cả kể cả đang ẩn để Admin quản lý
    const banners = await Banner.find({})
        .sort({ priority: -1, updatedAt: -1 });

    res.status(200).json({ success: true, data: banners });
});

/**
 * @desc    Get single banner by ID
 * @route   GET /api/banners/:id
 * @access  Private/Admin
 */
export const getBannerById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid banner ID format");
    }

    const banner = await Banner.findById(id);

    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    res.status(200).json({ success: true, data: banner });
});

/**
 * @desc    Create a new banner
 * @route   POST /api/banners
 * @access  Private/Admin
 */
export const createBanner = asyncHandler(async (req: Request, res: Response) => {
    const { title, bannerImg, charImg, link, priority, active } = req.body;

    if (!title || !bannerImg || !charImg || !link) {
        res.status(400);
        throw new Error("Please provide title, bannerImg, charImg, and link");
    }

    const banner = new Banner({
        title,
        bannerImg,
        charImg,
        link,
        priority: priority || 0,
        active: active !== undefined ? active : true
    });

    const createdBanner = await banner.save();
    res.status(201).json({ success: true, data: createdBanner });
});

/**
 * @desc    Update a banner
 * @route   PUT /api/banners/:id
 * @access  Private/Admin
 */
export const updateBanner = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid banner ID format");
    }

    const banner = await Banner.findById(id);

    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    // Cập nhật dữ liệu
    const updatedBanner = await Banner.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedBanner });
});

/**
 * @desc    Delete a banner
 * @route   DELETE /api/banners/:id
 * @access  Private/Admin
 */
export const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid banner ID format");
    }

    const banner = await Banner.findById(id);

    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    await Banner.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
});