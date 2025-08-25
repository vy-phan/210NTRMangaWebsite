import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Manga from '../models/MangaModels';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get a single manga by its ID
 * @route   GET /api/manga/:id
 * @access  Public
 */
export const getMangaById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404); // Not Found là hợp lý hơn 400
        throw new Error("Invalid manga ID format");
    }

    const manga = await Manga.findById(id).populate('genres');

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
export const getMangaBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const manga = await Manga.findOne({ slug }).populate('genres');

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
export const getManga = asyncHandler(async (req: Request, res: Response) => {
    const mangas = await Manga.find().populate('genres').sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: mangas });
});

/**
 * @desc    Get the total count of mangas
 * @route   GET /api/manga/count
 * @access  Public
 */
export const getLengthManga = asyncHandler(async (req: Request, res: Response) => {
    const mangaCount = await Manga.countDocuments();
    res.status(200).json({ success: true, data: mangaCount });
});

/**
 * @desc    Create a new manga
 * @route   POST /api/manga
 * @access  Private/Admin
 */
export const postManga = asyncHandler(async (req: Request, res: Response) => {
    const { title, slug, genres, poster } = req.body;

    // Chỉ kiểm tra các trường thực sự bắt buộc
    if (!title || !slug || !genres || !poster) {
        res.status(400); // Bad Request
        throw new Error("Please provide title, slug, genres, and poster");
    }

    const newManga = new Manga(req.body);
    const createdManga = await newManga.save();

    res.status(201).json({ success: true, data: createdManga });
});

/**
 * @desc    Delete a manga by its ID
 * @route   DELETE /api/manga/:id
 * @access  Private/Admin
 */
export const deleteManga = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid manga ID format");
    }

    const manga = await Manga.findByIdAndDelete(id);

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
export const updateManga = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid manga ID format");
    }

    const updatedManga = await Manga.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true } // `new: true` để trả về doc đã cập nhật
    ).populate('genres');

    if (!updatedManga) {
        res.status(404);
        throw new Error("Manga not found, cannot update");
    }

    res.status(200).json({ success: true, data: updatedManga });
});