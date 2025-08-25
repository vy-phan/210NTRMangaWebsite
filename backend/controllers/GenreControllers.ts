import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Genre from '../models/GenreModels';
import mongoose from 'mongoose';
import Manga from '../models/MangaModels';


export const createGenre = asyncHandler(async (req: Request, res: Response) => {
    const { name, slug, description } = req.body;


    if (!name || !slug) {
        res.status(400).json({ success: false, message: "Please provide name and slug for the genre" });
        return;
    }


    const genreExists = await Genre.findOne({ $or: [{ name }, { slug }] });
    if (genreExists) {
        res.status(400).json({ success: false, message: "Genre with this name or slug already exists" });
        return;
    }


    const genre = await Genre.create({
        name,
        slug,
        description,
    });

    if (genre) {
        res.status(201).json({ success: true, data: genre });
    } else {
        res.status(400).json({ success: false, message: "Invalid genre data" });
    }
});


export const getAllGenres = asyncHandler(async (req: Request, res: Response) => {
    const genres = await Genre.aggregate([
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

export const getLengthGenres = asyncHandler(async (req: Request, res: Response) => {
    try {
        const count = await Genre.countDocuments();
        res.status(200).json({ success: true, data: count });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
        console.error("Error counting genres:", error);
    }
}
);


export const getGenreBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const genre = await Genre.findOne({ slug });


    if (!genre) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }

    const mangasInGenre = await Manga.find({ genres: genre._id })
        .sort({ updatedAt: -1 })
        .populate('genres');

    res.status(200).json({
        success: true,
        data: {
            genre: genre,         // Thông tin chi tiết của thể loại (name, description...)
            mangas: mangasInGenre // Danh sách các truyện thuộc thể loại đó
        }
    });
});


export const updateGenre = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid genre ID" });
        return;
    }

    const genre = await Genre.findById(id);

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


export const deleteGenre = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid genre ID" });
        return;
    }

    const genre = await Genre.findByIdAndDelete(id);

    if (!genre) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    res.status(200).json({ success: true, message: "Genre deleted successfully" });
});