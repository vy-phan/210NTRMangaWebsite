"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.updateNotification = exports.createNotification = exports.getAllNotifications = exports.getActiveNotification = void 0;
const NotificationModels_1 = __importDefault(require("../models/NotificationModels"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @desc    Get the latest active notification
 * @route   GET /api/notifications/active
 * @access  Public
 */
exports.getActiveNotification = (0, express_async_handler_1.default)(async (req, res) => {
    // Chỉ lấy 1 thông báo cuối cùng đang active
    const notification = await NotificationModels_1.default.findOne({ isActive: true }).sort({ createdAt: -1 });
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
exports.getAllNotifications = (0, express_async_handler_1.default)(async (req, res) => {
    const notifications = await NotificationModels_1.default.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
});
/**
 * @desc    Create a new notification
 * @route   POST /api/notifications
 * @access  Private/Admin
 */
exports.createNotification = (0, express_async_handler_1.default)(async (req, res) => {
    const { content, isActive } = req.body;
    if (!content) {
        res.status(400);
        throw new Error("Content is required");
    }
    // Nếu tạo mới và set là active, có thể tắt các cái cũ đi (tùy nhu cầu)
    if (isActive) {
        await NotificationModels_1.default.updateMany({ isActive: true }, { isActive: false });
    }
    const newNotification = await NotificationModels_1.default.create({
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
exports.updateNotification = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid ID format");
    }
    // Nếu bật cái này lên active, tắt hết cái khác
    if (isActive === true) {
        await NotificationModels_1.default.updateMany({ _id: { $ne: id } }, { isActive: false });
    }
    const updated = await NotificationModels_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
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
exports.deleteNotification = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid ID format");
    }
    const deleted = await NotificationModels_1.default.findByIdAndDelete(id);
    if (!deleted) {
        res.status(404);
        throw new Error("Notification not found");
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
});
//# sourceMappingURL=NotificationControllers.js.map