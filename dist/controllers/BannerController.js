"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.createBanner = exports.getBannerById = exports.getAllBannersAdmin = exports.getBanners = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const BannerModels_1 = __importDefault(require("../models/BannerModels"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @desc    Get all ACTIVE banners (For Frontend User)
 * @route   GET /api/banners
 * @access  Public
 */
exports.getBanners = (0, express_async_handler_1.default)(async (req, res) => {
    // Chỉ lấy banner đang bật (active: true) và sắp xếp theo độ ưu tiên (priority cao lên đầu)
    const banners = await BannerModels_1.default.find({ active: true })
        .sort({ priority: -1, updatedAt: -1 });
    res.status(200).json({ success: true, data: banners });
});
/**
 * @desc    Get ALL banners (For Admin Dashboard)
 * @route   GET /api/banners/admin/all
 * @access  Private/Admin
 */
exports.getAllBannersAdmin = (0, express_async_handler_1.default)(async (req, res) => {
    // Lấy tất cả kể cả đang ẩn để Admin quản lý
    const banners = await BannerModels_1.default.find({})
        .sort({ priority: -1, updatedAt: -1 });
    res.status(200).json({ success: true, data: banners });
});
/**
 * @desc    Get single banner by ID
 * @route   GET /api/banners/:id
 * @access  Private/Admin
 */
exports.getBannerById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid banner ID format");
    }
    const banner = await BannerModels_1.default.findById(id);
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
exports.createBanner = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, bannerImg, charImg, link, priority, active } = req.body;
    if (!title || !bannerImg || !charImg || !link) {
        res.status(400);
        throw new Error("Please provide title, bannerImg, charImg, and link");
    }
    const banner = new BannerModels_1.default({
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
exports.updateBanner = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid banner ID format");
    }
    const banner = await BannerModels_1.default.findById(id);
    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }
    // Cập nhật dữ liệu
    const updatedBanner = await BannerModels_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedBanner });
});
/**
 * @desc    Delete a banner
 * @route   DELETE /api/banners/:id
 * @access  Private/Admin
 */
exports.deleteBanner = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid banner ID format");
    }
    const banner = await BannerModels_1.default.findById(id);
    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }
    await BannerModels_1.default.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Banner deleted successfully" });
});
//# sourceMappingURL=BannerController.js.map