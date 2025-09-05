"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateManga = exports.deleteManga = exports.postManga = exports.getLengthManga = exports.getManga = exports.getMangaBySlug = exports.getMangaById = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MangaModels_1 = __importDefault(require("../models/MangaModels"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
/**
 * @desc    Get a single manga by its ID
 * @route   GET /api/manga/:id
 * @access  Public
 */
exports.getMangaById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(404); // Not Found là hợp lý hơn 400
        throw new Error("Invalid manga ID format");
    }
    const manga = await MangaModels_1.default.findById(id).populate('genres');
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found");
    }
    res.status(200).json({ success: true, data: manga });
});
/**
 * @desc    Get a single manga by its slug
 * @route   GET /api/manga/slug/:slug
 * @access  Public
 */
exports.getMangaBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const manga = await MangaModels_1.default.findOne({ slug }).populate('genres');
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found with that slug");
    }
    res.status(200).json({ success: true, data: manga });
});
/**
 * @desc    Get all mangas
 * @route   GET /api/manga
 * @access  Public
 */
exports.getManga = (0, express_async_handler_1.default)(async (req, res) => {
    const mangas = await MangaModels_1.default.find().populate('genres').sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: mangas });
});
/**
 * @desc    Get the total count of mangas
 * @route   GET /api/manga/count
 * @access  Public
 */
exports.getLengthManga = (0, express_async_handler_1.default)(async (req, res) => {
    const mangaCount = await MangaModels_1.default.countDocuments();
    res.status(200).json({ success: true, data: mangaCount });
});
/**
 * @desc    Create a new manga
 * @route   POST /api/manga
 * @access  Private/Admin
 */
exports.postManga = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, slug, genres, poster } = req.body;
    // Chỉ kiểm tra các trường thực sự bắt buộc
    if (!title || !slug || !genres || !poster) {
        res.status(400); // Bad Request
        throw new Error("Please provide title, slug, genres, and poster");
    }
    const newManga = new MangaModels_1.default(req.body);
    const createdManga = await newManga.save();
    res.status(201).json({ success: true, data: createdManga });
});
/**
 * @desc    Delete a manga by its ID
 * @route   DELETE /api/manga/:id
 * @access  Private/Admin
 */
exports.deleteManga = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid manga ID format");
    }
    const manga = await MangaModels_1.default.findByIdAndDelete(id);
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found, cannot delete");
    }
    res.status(200).json({ success: true, message: "Manga deleted successfully" });
});
/**
 * @desc    Update a manga by its ID
 * @route   PUT /api/manga/:id
 * @access  Private/Admin
 */
exports.updateManga = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid manga ID format");
    }
    const updatedManga = await MangaModels_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true } // `new: true` để trả về doc đã cập nhật
    ).populate('genres');
    if (!updatedManga) {
        res.status(404);
        throw new Error("Manga not found, cannot update");
    }
    res.status(200).json({ success: true, data: updatedManga });
});
//# sourceMappingURL=MangaControllers.js.map