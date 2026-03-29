import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Chapter from '../models/ChapterModels';
import Manga from '../models/MangaModels';
import mongoose from 'mongoose';

/**
 * @desc    Get all chapters for a specific manga
 * @route   GET /api/chapters/manga/:mangaId
 * @access  Public
 */
export const getChaptersByMangaId = asyncHandler(async (req: Request, res: Response) => {
    const { mangaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(mangaId)) {
        res.status(400);
        throw new Error("Invalid Manga ID");
    }

    const chapters = await Chapter.find({ manga: mangaId }).sort({ number: -1 }); // Sắp xếp chương mới nhất lên đầu
    res.status(200).json({ success: true, data: chapters });
});

export const getChapterById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);

    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }
    res.status(200).json({ success: true, data: chapter });
});

export const getChapterByMangaAndNumber = asyncHandler(async (req: Request, res: Response) => { // <<-- 2. Áp dụng kiểu vào đây
    const { mangaSlug, chapterNumber } = req.params;

    // 1. Tìm manga dựa trên slug để lấy ID
    const manga = await Manga.findOne({ slug: mangaSlug });
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found");
    }

    // 2. Tìm chương dựa trên manga ID và số chương
    const chapter = await Chapter.findOne({ manga: manga._id, number: Number(chapterNumber) });
    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }
    const totalChapters = await Chapter.countDocuments({ manga: manga._id });

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
export const createChapter = asyncHandler(async (req: Request, res: Response) => {
    const { number, title, manga, images } = req.body;

    // === SỬA LẠI LOGIC VALIDATION Ở ĐÂY ===
    // Kiểm tra `number` một cách tường minh, cho phép giá trị 0
    if (typeof number !== 'number' || !title || !manga || !images || !Array.isArray(images) || images.length === 0) {
        res.status(400);
        throw new Error("Please provide all required fields correctly (number, title, manga, images array)");
    }

    // Kiểm tra xem manga có tồn tại không
    const mangaExists = await Manga.findById(manga);
    if (!mangaExists) {
        res.status(404);
        throw new Error("Manga not found for this chapter");
    }

    // (Tùy chọn) Kiểm tra xem chương đã tồn tại chưa
    const chapterExists = await Chapter.findOne({ manga, number });
    if (chapterExists) {
        res.status(400);
        throw new Error(`Chapter number ${number} already exists for this manga.`);
    }

    const chapter = await Chapter.create({ number, title, manga, images });
    // CẬP NHẬT THỜI GIAN CHO MANGA
    await Manga.findByIdAndUpdate(
        manga,
        { updatedAt: new Date() },
        { new: true }
    );
    res.status(201).json({ success: true, data: chapter });
});

/**
 * @desc    Update an existing chapter
 * @route   PUT /api/chapters/:id
 * @access  Private/Admin
 */
export const updateChapter = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);

    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(id, req.body, { new: true });

    // Cập nhật lại thời gian cho Manga 
    if (updatedChapter) {
        await Manga.findByIdAndUpdate(updatedChapter.manga, { updatedAt: new Date() });
    }

    res.status(200).json({ success: true, data: updatedChapter });
});

/**
 * @desc    Delete a chapter
 * @route   DELETE /api/chapters/:id
 * @access  Private/Admin
 */
export const deleteChapter = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);

    if (!chapter) {
        res.status(404);
        throw new Error("Chapter not found");
    }

    await chapter.deleteOne();
    res.status(200).json({ success: true, message: "Chapter deleted successfully" });
});