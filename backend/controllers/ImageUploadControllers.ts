import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import imagekit from '../config/imagekit'; // Import file config mới
import ImageUpload from '../models/ImageUploadModel';
import mongoose from 'mongoose';

/**
 * @desc    Upload nhiều ảnh cho một chapter của manga lên ImageKit
 * @route   POST /api/images/upload
 * @access  Private/Admin
 */
export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
    const { mangaName, chapter } = req.body;

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

    // Folder trên ImageKit (Ví dụ: mangas/Naruto hoặc mangas/Naruto/Chapter1)
    let folderName = `mangas/${mangaName}`;
    if (chapter) {
        folderName += `/${chapter}`;
    }

    // Tạo mảng các Promise để upload song song
    const uploadPromises = files.map(file => {
        return imagekit.upload({
            file: file.buffer, // ImageKit nhận trực tiếp Buffer
            fileName: file.originalname, // Tên file
            folder: folderName, // Thư mục lưu trữ
            tags: [mangaName] // Gắn tag để dễ quản lý sau này
        });
    });

    try {
        // Chờ tất cả ảnh upload xong
        const uploadResults = await Promise.all(uploadPromises);

        // Map kết quả trả về từ ImageKit vào cấu trúc Model của MongoDB
        // Lưu ý: ImageKit trả về "fileId", Cloudinary trả về "public_id".
        // Để không phải sửa Model, ta gán fileId vào public_id.
        const imagesToSave = uploadResults.map(result => ({
            // Tự động chuyển đổi sang WebP thông qua URL transformation
            secure_url: imagekit.url({
                src: result.url,
                transformation: [{ format: 'webp' }]
            }),
            public_id: result.fileId,     // ID file (dùng để xóa sau này)
            folder: folderName,
            mangaName: mangaName,
            chapter: chapter || null, // Lưu thông tin chapter nếu có
        }));

        // Lưu vào MongoDB
        const savedImages = await ImageUpload.insertMany(imagesToSave);

        res.status(201).json({
            success: true,
            message: `${savedImages.length} images uploaded successfully to ImageKit.`,
            data: savedImages,
        });

    } catch (error) {
        console.error('ImageKit upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Image upload failed. Please check server logs.',
            error: error
        });
    }
});

/**
 * @desc    Lấy danh sách ảnh theo tên Manga (Không đổi logic)
 * @route   GET /api/images/manga/:mangaName
 */
export const getImagesByMangaName = asyncHandler(async (req: Request, res: Response) => {
    const { mangaName } = req.params;

    // Sắp xếp theo tên file hoặc thời gian tạo để truyện đọc đúng thứ tự
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
 * @desc    Xóa ảnh khỏi ImageKit và Database
 * @route   DELETE /api/images/:id
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
        // Xóa trên ImageKit bằng fileId (đã lưu vào cột public_id trong DB)
        await imagekit.deleteFile(imageToDelete.public_id);
    } catch (error) {
        console.error('ImageKit deletion failed:', error);
        // Tùy chọn: Có thể vẫn cho xóa trong DB nếu file trên ImageKit không tìm thấy
        res.status(500).json({
            success: false,
            message: 'Failed to delete image from ImageKit.'
        });
        return;
    }

    // Xóa trong MongoDB
    await imageToDelete.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Image deleted successfully from ImageKit and database.'
    });
});

/**
 * @desc    Xóa tất cả ảnh của một Chapter (Folder) và cả folder đó trên ImageKit
 * @route   DELETE /api/images/chapter
 * @access  Private/Admin
 */
export const deleteImagesByChapter = asyncHandler(async (req: Request, res: Response) => {
    const { mangaName, chapter } = req.body;

    if (!mangaName || !chapter) {
        res.status(400).json({
            success: false,
            message: 'Manga name and Chapter are required.'
        });
        return;
    }

    // Đường dẫn folder trên ImageKit: mangas/Naruto/1
    const folderPath = `mangas/${mangaName}/${chapter}`;

    try {
        // 1. Xóa folder trên ImageKit
        // Hàm deleteFolder của ImageKit sẽ xóa toàn bộ nội dung trong folder và bản thân folder đó.
        // Đây là cách triệt để nhất để "dọn dẹp" storage.
        await imagekit.deleteFolder(folderPath);
        console.log(`Successfully deleted folder on ImageKit: ${folderPath}`);

    } catch (error: any) {
        // Nếu lỗi không phải là 404 (không tìm thấy), ta log lại lỗi
        // (404 có nghĩa là folder đã bị xóa hoặc chưa từng tồn tại, có thể bỏ qua)
        if (error.statusCode !== 404) {
            console.error('ImageKit deleteFolder error:', error);
        }
    }

    // 2. Xóa sạch các bản ghi ảnh liên quan trong MongoDB
    const result = await ImageUpload.deleteMany({
        mangaName,
        chapter: chapter.toString()
    });

    res.status(200).json({
        success: true,
        message: `Đã xóa ${result.deletedCount} bản ghi và thư mục chương "${chapter}" thành công.`,
    });
});

/**
 * @desc    Xóa tất cả ảnh của một Manga (Folder) và cả folder đó trên ImageKit
 * @route   POST /api/images/delete-manga
 * @access  Private/Admin
 */
export const deleteImagesByManga = asyncHandler(async (req: Request, res: Response) => {
    const { mangaName } = req.body;

    if (!mangaName) {
        res.status(400).json({
            success: false,
            message: 'Manga name is required.'
        });
        return;
    }

    // Đường dẫn folder trên ImageKit: mangas/Naruto
    const folderPath = `mangas/${mangaName}`;

    try {
        // 1. Xóa folder trên ImageKit
        await imagekit.deleteFolder(folderPath);
        console.log(`Successfully deleted folder on ImageKit: ${folderPath}`);

    } catch (error: any) {
        if (error.statusCode !== 404) {
            console.error('ImageKit deleteFolder error:', error);
        }
    }

    // 2. Xóa sạch các bản ghi ảnh liên quan trong MongoDB
    const result = await ImageUpload.deleteMany({ mangaName });

    res.status(200).json({
        success: true,
        message: `Đã xóa ${result.deletedCount} bản ghi và thư mục truyện "${mangaName}" thành công.`,
    });
});