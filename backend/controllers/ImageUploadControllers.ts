import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { bufferToDataURI, uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import ImageUpload from '../models/ImageUploadModel';
import mongoose from 'mongoose';

/**
 * @desc    Upload nhiều ảnh cho một chapter của manga
 * @route   POST /api/images/upload
 * @access  Private/Admin
 */
export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
    const { mangaName } = req.body;

    if (!mangaName) {
        res.status(400).json({
            success: false,
            message: 'Manga name is a required field.'
        });
        return; 
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        res.status(400).json({
            success: false,
            message: 'No image files were uploaded.'
        });
        return; 
    }

    const folderName = `mangas/${mangaName}`;

    const uploadPromises = files.map(file => {
        const dataUri = bufferToDataURI(file);
        if (!dataUri) {
            console.warn(`Could not process file: ${file.originalname}`);
            return Promise.resolve(null);
        }
        return uploadToCloudinary(dataUri, folderName);
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
        secure_url: result!.secure_url,
        public_id: result!.public_id,
        folder: folderName, 
        mangaName: mangaName,
    }));

    const savedImages = await ImageUpload.insertMany(imagesToSave);

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
export const getImagesByMangaName = asyncHandler(async (req: Request, res: Response) => {
    const { mangaName } = req.params;

    const images = await ImageUpload.find({ mangaName }).sort({ createdAt: 1 });

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
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
            success: false,
            message: 'Invalid image ID format.'
        });
        return; 
    }

    const imageToDelete = await ImageUpload.findById(id);

    if (!imageToDelete) {
        res.status(404).json({
            success: false,
            message: 'Image not found in the database.'
        });
        return; 
    }

    try {
        await deleteFromCloudinary(imageToDelete.public_id);
    } catch (error) {
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