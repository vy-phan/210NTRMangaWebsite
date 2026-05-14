"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMangaStats = exports.getGenreStats = exports.updateManga = exports.deleteManga = exports.postManga = exports.getLengthManga = exports.getManga = exports.getRelatedMangas = exports.getMangaByCategory = exports.getMangaBySlug = exports.getMangaTitleById = exports.getMangaById = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MangaModels_1 = __importDefault(require("../models/MangaModels"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ChapterModels_1 = __importDefault(require("../models/ChapterModels"));
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
 * @desc    Get only manga title by its ID
 * @route   GET /api/manga/:id/title
 * @access  Public
 */
exports.getMangaTitleById = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(404);
        throw new Error("Invalid manga ID format");
    }
    const manga = await MangaModels_1.default.findById(id).select('title');
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
 * @desc    Get mangas by category (Manga, Manhwa)
 * @route   GET /api/manga/category/:category
 * @access  Public
 */
exports.getMangaByCategory = (0, express_async_handler_1.default)(async (req, res) => {
    const { category } = req.params;
    const mangas = await MangaModels_1.default.find({
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
exports.getRelatedMangas = (0, express_async_handler_1.default)(async (req, res) => {
    const { currentId, genreIds } = req.body;
    if (!currentId || !genreIds || !Array.isArray(genreIds)) {
        res.status(400);
        throw new Error("Missing parameters");
    }
    const relatedMangas = await MangaModels_1.default.find({
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
exports.getManga = (0, express_async_handler_1.default)(async (req, res) => {
    const mangas = await MangaModels_1.default.aggregate([
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
    const manga = await MangaModels_1.default.findById(id);
    if (!manga) {
        res.status(404);
        throw new Error("Manga not found, cannot delete");
    }
    await ChapterModels_1.default.deleteMany({ manga: id });
    await MangaModels_1.default.findByIdAndDelete(id);
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
/**
 * @desc    Get top 5 popular genres
 * @route   GET /api/manga/genre-stats
 * @access  Public
 */
exports.getGenreStats = (0, express_async_handler_1.default)(async (req, res) => {
    const genreStats = await MangaModels_1.default.aggregate([
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
exports.getMangaStats = (0, express_async_handler_1.default)(async (req, res) => {
    // 1. Thống kê theo trạng thái (Status)
    const statusStats = await MangaModels_1.default.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
    // 2. Thống kê theo thể loại (Genres) - Top 5
    const genreStats = await MangaModels_1.default.aggregate([
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
    const categoryStats = await MangaModels_1.default.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);
    // 4. Tổng số Chapter
    const totalChapters = await ChapterModels_1.default.countDocuments();
    // 5. Tăng trưởng Upload Chapter trong 7 ngày gần nhất
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const growthStats = await ChapterModels_1.default.aggregate([
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
//# sourceMappingURL=MangaControllers.js.map