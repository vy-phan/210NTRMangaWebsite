"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.getImagesByMangaName = exports.uploadImages = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const cloudinary_1 = require("../config/cloudinary");
const ImageUploadModel_1 = __importDefault(require("../models/ImageUploadModel"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @desc    Upload nhiều ảnh cho một chapter của manga
 * @route   POST /api/images/upload
 * @access  Private/Admin
 */
exports.uploadImages = (0, express_async_handler_1.default)(async (req, res) => {
    const { mangaName } = req.body;
    if (!mangaName) {
        res.status(400).json({
            success: false,
            message: 'Manga name is a required field.'
        });
        return;
    }
    const files = req.files;
    if (!files || files.length === 0) {
        res.status(400).json({
            success: false,
            message: 'No image files were uploaded.'
        });
        return;
    }
    const folderName = `mangas/${mangaName}`;
    const uploadPromises = files.map(file => {
        const dataUri = (0, cloudinary_1.bufferToDataURI)(file);
        if (!dataUri) {
            console.warn(`Could not process file: ${file.originalname}`);
            return Promise.resolve(null);
        }
        return (0, cloudinary_1.uploadToCloudinary)(dataUri, folderName);
    });
    const uploadResults = (await Promise.all(uploadPromises)).filter(result => result !== null);
    if (uploadResults.length === 0) {
        res.status(500).json({
            success: false,
            message: 'Image upload failed for all files. Please check server logs.'
        });
        return;
    }
    const imagesToSave = uploadResults.map(result => ({
        secure_url: result.secure_url,
        public_id: result.public_id,
        folder: folderName,
        mangaName: mangaName,
    }));
    const savedImages = await ImageUploadModel_1.default.insertMany(imagesToSave);
    res.status(201).json({
        success: true,
        message: `${savedImages.length} images uploaded successfully.`,
        data: savedImages,
    });
});
/**
 * @desc    Get all images for a specific manga by mangaName
 * @route   GET /api/images/manga/:mangaName
 * @access  Public or Private
 */
exports.getImagesByMangaName = (0, express_async_handler_1.default)(async (req, res) => {
    const { mangaName } = req.params;
    const images = await ImageUploadModel_1.default.find({ mangaName }).sort({ createdAt: 1 });
    if (!images || images.length === 0) {
        res.status(404).json({
            success: false,
            message: `No images found for manga: ${mangaName}`
        });
        return;
    }
    res.status(200).json({
        success: true,
        data: images
    });
});
/**
 * @desc    Delete a single image by its MongoDB ID
 * @route   DELETE /api/images/:id
 * @access  Private/Admin
 */
exports.deleteImage = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid image ID format.'
        });
        return;
    }
    const imageToDelete = await ImageUploadModel_1.default.findById(id);
    if (!imageToDelete) {
        res.status(404).json({
            success: false,
            message: 'Image not found in the database.'
        });
        return;
    }
    try {
        await (0, cloudinary_1.deleteFromCloudinary)(imageToDelete.public_id);
    }
    catch (error) {
        console.error('Cloudinary deletion failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image from Cloudinary. The image in the database was not deleted.'
        });
        return;
    }
    await imageToDelete.deleteOne();
    res.status(200).json({
        success: true,
        message: 'Image deleted successfully from both Cloudinary and database.'
    });
});
//# sourceMappingURL=ImageUploadControllers.js.map