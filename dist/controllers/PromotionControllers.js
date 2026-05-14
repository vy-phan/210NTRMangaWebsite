"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePromotion = exports.updatePromotion = exports.createPromotion = exports.getPromotionById = exports.getPromotions = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const PromotionModels_1 = __importDefault(require("../models/PromotionModels"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @desc    Get all promotions
 * @route   GET /api/promotions
 * @access  Public
 */
exports.getPromotions = (0, express_async_handler_1.default)(async (req, res) => {
    const filter = { active: true };
    const promotions = await PromotionModels_1.default.find(filter).sort({ priority: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: promotions });
});
/**
 * @desc    Get promotion by ID
 * @route   GET /api/promotions/:id
 * @access  Private/Admin
 */
exports.getPromotionById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid promotion ID");
    }
    const promotion = await PromotionModels_1.default.findById(id);
    if (!promotion) {
        res.status(404);
        throw new Error("Promotion not found");
    }
    res.status(200).json({ success: true, data: promotion });
});
/**
 * @desc    Create a new promotion
 * @route   POST /api/promotions
 * @access  Private/Admin
 */
exports.createPromotion = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, image, link } = req.body;
    if (!title || !image || !link) {
        res.status(400);
        throw new Error("Please provide title, image, and link");
    }
    const promotion = await PromotionModels_1.default.create(req.body);
    res.status(201).json({ success: true, data: promotion });
});
/**
 * @desc    Update a promotion
 * @route   PUT /api/promotions/:id
 * @access  Private/Admin
 */
exports.updatePromotion = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid promotion ID");
    }
    const promotion = await PromotionModels_1.default.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });
    if (!promotion) {
        res.status(404);
        throw new Error("Promotion not found");
    }
    res.status(200).json({ success: true, data: promotion });
});
/**
 * @desc    Delete a promotion
 * @route   DELETE /api/promotions/:id
 * @access  Private/Admin
 */
exports.deletePromotion = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid promotion ID");
    }
    const promotion = await PromotionModels_1.default.findByIdAndDelete(id);
    if (!promotion) {
        res.status(404);
        throw new Error("Promotion not found");
    }
    res.status(200).json({ success: true, message: "Promotion removed" });
});
//# sourceMappingURL=PromotionControllers.js.map