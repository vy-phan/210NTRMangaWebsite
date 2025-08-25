import mongoose from 'mongoose'
import Manga from '../models/MangaModels';


export const getMangaById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "No such manga with this ID" });
    }

    try {
        const manga = await Manga.findById(id).populate('genres');

        if (!manga) {
            return res.status(404).json({ success: false, message: "Manga not found" });
        }

        res.status(200).json({ success: true, data: manga });
    } catch (error) {
        console.error("Error in GET Manga by ID:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getMangaBySlug = async (req, res) => {
    const { slug } = req.params;

    if (!slug) {
        res.status(400).json({ success: false, message: "Slug is required" });
        return;
    }

    const manga = await Manga.findOne({ slug }).populate('genres');

    if (!manga) {
        // Trả về 404 nếu không tìm thấy manga trong DB
        res.status(404).json({ success: false, message: "Manga not found with that slug" });
        return;
    }

    res.status(200).json({ success: true, data: manga });
};


export const getManga = (async (req, res) => {
    const mangas = await Manga.find().populate('genres').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: mangas });
});

export const getLengthManga = async (req, res) => {
    try {
        const mangaCount = await Manga.countDocuments();
        res.status(200).json({ success: true, data: mangaCount });
    } catch (error) {
        console.error("Error getting manga count:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const postManga = async (req, res) => {
    const manga = req.body

    if (!manga.title || !manga.slug || !manga.status || !manga.genres || !manga.poster) {
        return res.status(400).json({ success: false, message: "Please provid all fields" })
    }

    const newManga = new Manga(manga)

    try {
        await newManga.save()
        res.status(201).json({ success: true, data: newManga })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Server Error" })
    }
}

export const deleteManga = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "No such manga" });
    }
    try {
        await Manga.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Manga deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export const updateManga = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "No such manga" });
    }

    try {
        const updatedManga = await Manga.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true }
        ).populate('genres');

        if (!updatedManga) {
            return res.status(404).json({ success: false, message: "Manga not found after update attempt" });
        }

        res.status(200).json({ success: true, data: updatedManga });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};