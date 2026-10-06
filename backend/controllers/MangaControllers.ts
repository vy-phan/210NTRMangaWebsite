import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Manga from '../models/MangaModels';
import asyncHandler from 'express-async-handler';
import Chapter from '../models/ChapterModels';
import { deleteMangaImagesHelper } from './ImageUploadControllers';

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
 * @desc    Get only manga title by its ID
 * @route   GET /api/manga/:id/title
 * @access  Public
 */
export const getMangaTitleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid manga ID format");
    }

    const manga = await Manga.findById(id).select('title');

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
 * @desc    Get mangas by category (Manga, Manhwa)
 * @route   GET /api/manga/category/:category
 * @access  Public
 */
export const getMangaByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;

    const mangas = await Manga.find({
        category: { $regex: new RegExp(`^${category}$`, 'i') }
    })
        .populate('genres')
        .sort({ updatedAt: -1 });

    res.status(200).json({
        success: true,
        data: mangas
    });
});

/**
 * @desc    Get related mangas based on genres
 * @route   POST /api/manga/related
 * @access  Public
 */
export const getRelatedMangas = asyncHandler(async (req: Request, res: Response) => {
    const { currentId, genreIds } = req.body;

    if (!currentId || !genreIds || !Array.isArray(genreIds)) {
        res.status(400);
        throw new Error("Missing parameters");
    }

    const relatedMangas = await Manga.find({
        _id: { $ne: currentId }, // Loại trừ truyện hiện tại
        genres: { $in: genreIds }, // Tìm truyện có chứa các genre này
        status: { $ne: 'Cancelled' } // (Tùy chọn) Không lấy truyện đã hủy
    })
        .populate('genres')
        .sort({ updatedAt: -1 })
        .limit(6);

    res.status(200).json({ success: true, data: relatedMangas });
});

/**
 * @desc    Get all mangas with 2 latest chapters
 * @route   GET /api/manga
 * @access  Public
 */
export const getManga = asyncHandler(async (req: Request, res: Response) => {
    const mangas = await Manga.aggregate([
        // 1. Sắp xếp truyện theo thời gian cập nhật mới nhất
        { $sort: { updatedAt: -1 } },

        // 2. Lookup (Join) với bảng 'chapters' để lấy 2 chương mới nhất
        {
            $lookup: {
                from: 'chapters', // Tên collection trong DB (thường là số nhiều, viết thường)
                let: { mangaId: '$_id' }, // Biến tạm lưu ID của manga hiện tại
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$manga', '$$mangaId'] } // Tìm chapter có manga id trùng khớp
                        }
                    },
                    { $sort: { number: -1 } }, // Sắp xếp chapter giảm dần (số lớn nhất lên đầu)
                    { $limit: 2 }, // Chỉ lấy 2 chapter đầu tiên
                    { $project: { title: 1, number: 1, _id: 1, createdAt: 1 } } // Chỉ lấy các trường cần thiết cho nhẹ
                ],
                as: 'latestChapters' // Tên trường mới chứa mảng 2 chapter này
            }
        },

        // 3. Lookup (Join) với bảng 'genres' (vì bạn dùng populate genres ở code cũ)
        {
            $lookup: {
                from: 'genres',
                localField: 'genres',
                foreignField: '_id',
                as: 'genres'
            }
        }
    ]);

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

    const manga = await Manga.findById(id);

    if (!manga) {
        res.status(404);
        throw new Error("Manga not found, cannot delete");
    }

    // Delete all images on ImageKit for this manga
    try {
        await deleteMangaImagesHelper(manga.slug);
    } catch (error) {
        console.error("Error deleting images from ImageKit:", error);
        // Continue with deletion even if image deletion fails
    }

    // Delete all chapters of this manga
    await Chapter.deleteMany({ manga: id });
    
    // Delete the manga itself
    await Manga.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Manga and all its images deleted successfully" });
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

/**
 * @desc    Get top 5 popular genres
 * @route   GET /api/manga/genre-stats
 * @access  Public
 */
export const getGenreStats = asyncHandler(async (req: Request, res: Response) => {
    const genreStats = await Manga.aggregate([
        { $unwind: '$genres' },
        {
            $lookup: {
                from: 'genres',
                localField: 'genres',
                foreignField: '_id',
                as: 'genreInfo'
            }
        },
        { $unwind: '$genreInfo' },
        {
            $group: {
                _id: '$genreInfo.name',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    const formattedGenreStats = genreStats.map(stat => ({
        name: stat._id,
        count: stat.count
    }));

    res.status(200).json({
        success: true,
        data: formattedGenreStats
    });
});


/**
 * @desc    Get manga statistics (status distribution, genre popularity)
 * @route   GET /api/manga/stats
 * @access  Private/Admin
 */
export const getMangaStats = asyncHandler(async (req: Request, res: Response) => {
    // 1. Thống kê theo trạng thái (Status)
    const statusStats = await Manga.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // 2. Thống kê theo thể loại (Genres) - Top 5
    const genreStats = await Manga.aggregate([
        // Unwind mảng genres để mỗi genre thành 1 doc
        { $unwind: '$genres' },
        // Lookup sang bảng genres để lấy tên
        {
            $lookup: {
                from: 'genres',
                localField: 'genres',
                foreignField: '_id',
                as: 'genreInfo'
            }
        },
        // Unwind mảng genreInfo (vì lookup trả về mảng)
        { $unwind: '$genreInfo' },
        // Group theo tên thể loại
        {
            $group: {
                _id: '$genreInfo.name',
                count: { $sum: 1 }
            }
        },
        // Sắp xếp giảm dần theo số lượng
        { $sort: { count: -1 } },
        // Lấy top 5
        { $limit: 5 }
    ]);

    // 3. Thống kê theo Thể loại (Manga/Manhwa)
    const categoryStats = await Manga.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);

    // 4. Tổng số Chapter
    const totalChapters = await Chapter.countDocuments();

    // 5. Tăng trưởng Upload Chapter trong 7 ngày gần nhất
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const growthStats = await Chapter.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Format lại dữ liệu cho đẹp
    const formattedStatusStats = statusStats.map(stat => ({
        status: stat._id || 'Unknown',
        count: stat.count
    }));

    const formattedGenreStats = genreStats.map(stat => ({
        name: stat._id,
        count: stat.count
    }));

    const formattedCategoryStats = categoryStats.map(stat => ({
        category: stat._id || 'Manga',
        count: stat.count
    }));

    res.status(200).json({
        success: true,
        data: {
            statusStats: formattedStatusStats,
            genreStats: formattedGenreStats,
            categoryStats: formattedCategoryStats,
            totalChapters,
            growthStats: growthStats.map(g => ({ date: g._id, count: g.count }))
        }
    });
});