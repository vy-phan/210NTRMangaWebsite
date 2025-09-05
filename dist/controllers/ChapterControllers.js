"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChapter = exports.updateChapter = exports.createChapter = exports.getChapterByMangaAndNumber = exports.getChapterById = exports.getChaptersByMangaId = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ChapterModels_1 = __importDefault(require("../models/ChapterModels"));
const MangaModels_1 = __importDefault(require("../models/MangaModels"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @desc    Get all chapters for a specific manga
 * @route   GET /api/chapters/manga/:mangaId
 * @access  Public
 */
exports.getChaptersByMangaId = (0, express_async_handler_1.default)(async (req, res) => {
    const { mangaId } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(mangaId)) {
        res.status(400);
        throw new Error("Invalid Manga ID");
    }
    const chapters = await ChapterModels_1.default.find({ manga: mangaId }).sort({ number: -1 }); // Sắp xếp chương mới nhất lên đầu
    res.status(200).json({ success: true, data: chapters });
});
exports.getChapterById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const chapter = await ChapterModels_1.default.findById(id);
    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }
    res.status(200).json({ success: true, data: chapter });
});
exports.getChapterByMangaAndNumber = (0, express_async_handler_1.default)(async (req, res) => {
    const { mangaSlug, chapterNumber } = req.params;
    // 1. Tìm manga dựa trên slug để lấy ID
    const manga = await MangaModels_1.default.findOne({ slug: mangaSlug });
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found");
    }
    // 2. Tìm chương dựa trên manga ID và số chương
    const chapter = await ChapterModels_1.default.findOne({ manga: manga._id, number: Number(chapterNumber) });
    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }
    const totalChapters = await ChapterModels_1.default.countDocuments({ manga: manga._id });
    // (Tùy chọn) Populate tên manga vào kết quả để frontend có thể hiển thị
    const chapterWithMangaTitle = await chapter.populate({
        path: 'manga',
        select: 'title' // Chỉ lấy trường 'title'
    });
    res.status(200).json({
        success: true, data: {
            chapter: chapterWithMangaTitle, // chapter đã populate
            totalChapters: totalChapters
        }
    });
});
/**
 * @desc    Create a new chapter for a manga
 * @route   POST /api/chapters
 * @access  Private/Admin
 */
exports.createChapter = (0, express_async_handler_1.default)(async (req, res) => {
    const { number, title, manga, images } = req.body;
    // === SỬA LẠI LOGIC VALIDATION Ở ĐÂY ===
    // Kiểm tra `number` một cách tường minh, cho phép giá trị 0
    if (typeof number !== 'number' || !title || !manga || !images || !Array.isArray(images) || images.length === 0) {
        res.status(400);
        throw new Error("Please provide all required fields correctly (number, title, manga, images array)");
    }
    // Kiểm tra xem manga có tồn tại không
    const mangaExists = await MangaModels_1.default.findById(manga);
    if (!mangaExists) {
        res.status(404);
        throw new Error("Manga not found for this chapter");
    }
    // (Tùy chọn) Kiểm tra xem chương đã tồn tại chưa
    const chapterExists = await ChapterModels_1.default.findOne({ manga, number });
    if (chapterExists) {
        res.status(400);
        throw new Error(`Chapter number ${number} already exists for this manga.`);
    }
    const chapter = await ChapterModels_1.default.create({ number, title, manga, images });
    res.status(201).json({ success: true, data: chapter });
});
/**
 * @desc    Update an existing chapter
 * @route   PUT /api/chapters/:id
 * @access  Private/Admin
 */
exports.updateChapter = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const chapter = await ChapterModels_1.default.findById(id);
    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }
    const updatedChapter = await ChapterModels_1.default.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedChapter });
});
/**
 * @desc    Delete a chapter
 * @route   DELETE /api/chapters/:id
 * @access  Private/Admin
 */
exports.deleteChapter = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const chapter = await ChapterModels_1.default.findById(id);
    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }
    await chapter.deleteOne();
    res.status(200).json({ success: true, message: "Chapter deleted successfully" });
});
//# sourceMappingURL=ChapterControllers.js.map