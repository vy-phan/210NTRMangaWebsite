import { Request, Response } from 'express';
import Notification from '../models/NotificationModels';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

/**
 * @desc    Get the latest active notification
 * @route   GET /api/notifications/active
 * @access  Public
 */
export const getActiveNotification = asyncHandler(async (req: Request, res: Response) => {
    // Chỉ lấy 1 thông báo cuối cùng đang active
    const notification = await Notification.findOne({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: notification
    });
});

/**
 * @desc    Get all notifications (for Admin list)
 * @route   GET /api/notifications
 * @access  Private/Admin
 */
export const getAllNotifications = asyncHandler(async (req: Request, res: Response) => {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
});

/**
 * @desc    Create a new notification
 * @route   POST /api/notifications
 * @access  Private/Admin
 */
export const createNotification = asyncHandler(async (req: Request, res: Response) => {
    const { content, isActive } = req.body;

    if (!content) {
        res.status(400);
        throw new Error("Content is required");
    }

    // Nếu tạo mới và set là active, có thể tắt các cái cũ đi (tùy nhu cầu)
    if (isActive) {
        await Notification.updateMany({ isActive: true }, { isActive: false });
    }

    const newNotification = await Notification.create({
        content,
        isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, data: newNotification });
});

/**
 * @desc    Update a notification
 * @route   PUT /api/notifications/:id
 * @access  Private/Admin
 */
export const updateNotification = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid ID format");
    }

    // Nếu bật cái này lên active, tắt hết cái khác
    if (isActive === true) {
        await Notification.updateMany({ _id: { $ne: id } }, { isActive: false });
    }

    const updated = await Notification.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updated) {
        res.status(404);
        throw new Error("Notification not found");
    }

    res.status(200).json({ success: true, data: updated });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private/Admin
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid ID format");
    }

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
        res.status(404);
        throw new Error("Notification not found");
    }

    res.status(200).json({ success: true, message: "Deleted successfully" });
});
