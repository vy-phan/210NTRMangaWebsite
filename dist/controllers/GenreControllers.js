"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGenre = exports.updateGenre = exports.getGenreBySlug = exports.getLengthGenres = exports.getAllGenres = exports.createGenre = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const GenreModels_1 = __importDefault(require("../models/GenreModels"));
const mongoose_1 = __importDefault(require("mongoose"));
const MangaModels_1 = __importDefault(require("../models/MangaModels"));
exports.createGenre = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, slug, description } = req.body;
    if (!name || !slug) {
        res.status(400).json({ success: false, message: "Please provide name and slug for the genre" });
        return;
    }
    const genreExists = await GenreModels_1.default.findOne({ $or: [{ name }, { slug }] });
    if (genreExists) {
        res.status(400).json({ success: false, message: "Genre with this name or slug already exists" });
        return;
    }
    const genre = await GenreModels_1.default.create({
        name,
        slug,
        description,
    });
    if (genre) {
        res.status(201).json({ success: true, data: genre });
    }
    else {
        res.status(400).json({ success: false, message: "Invalid genre data" });
    }
});
exports.getAllGenres = (0, express_async_handler_1.default)(async (req, res) => {
    const genres = await GenreModels_1.default.aggregate([
        {
            $lookup: {
                from: 'mangas',
                localField: '_id',
                foreignField: 'genres',
                as: 'mangas'
            }
        },
        {
            $addFields: {
                count: { $size: '$mangas' }
            }
        },
        {
            $project: {
                mangas: 0
            }
        },
        {
            $sort: { name: 1 }
        }
    ]);
    res.status(200).json({ success: true, data: genres });
});
exports.getLengthGenres = (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const count = await GenreModels_1.default.countDocuments();
        res.status(200).json({ success: true, data: count });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
        console.error("Error counting genres:", error);
    }
});
exports.getGenreBySlug = (0, express_async_handler_1.default)(async (req, res) => {
    const { slug } = req.params;
    const genre = await GenreModels_1.default.findOne({ slug });
    if (!genre) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    const mangasInGenre = await MangaModels_1.default.find({ genres: genre._id })
        .sort({ updatedAt: -1 })
        .populate('genres');
    res.status(200).json({
        success: true,
        data: {
            genre: genre, // Thông tin chi tiết của thể loại (name, description...)
            mangas: mangasInGenre // Danh sách các truyện thuộc thể loại đó
        }
    });
});
exports.updateGenre = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { name, slug, description } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid genre ID" });
        return;
    }
    const genre = await GenreModels_1.default.findById(id);
    if (!genre) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    genre.name = name || genre.name;
    genre.slug = slug || genre.slug;
    genre.description = description || genre.description;
    const updatedGenre = await genre.save();
    res.status(200).json({ success: true, data: updatedGenre });
});
exports.deleteGenre = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid genre ID" });
        return;
    }
    const genre = await GenreModels_1.default.findByIdAndDelete(id);
    if (!genre) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    res.status(200).json({ success: true, message: "Genre deleted successfully" });
});
//# sourceMappingURL=GenreControllers.js.map