import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import imagekit from '../config/imagekit';
import Manga from '../models/MangaModels';
import ImageUpload from '../models/ImageUploadModel';
import Chapter from '../models/ChapterModels';

/**
 * Helper: Lấy danh sách tên folder con trên ImageKit tại đường dẫn parentPath
 */
const listImageKitFolders = async (parentPath: string): Promise<string[]> => {
    try {
        const result = await imagekit.listFiles({
            path: parentPath,
            type: 'folder',
            limit: 500,
        } as any);
        return (result as any[]).map((f: any) => f.name);
    } catch (error: any) {
        // Folder cha không tồn tại → trả về rỗng
        if (error.statusCode === 404) return [];
        throw error;
    }
};

/**
 * @desc    Kiểm tra & đồng bộ trạng thái storage ImageKit với MongoDB
 * @route   GET /api/images/sync-status
 * @access  Private/Admin
 */
export const getStorageSyncStatus = asyncHandler(async (req: Request, res: Response) => {
    // 1. Lấy tất cả slug folder cấp 1 trên ImageKit (mangas/<slug>)
    const imagekitMangaSlugs = await listImageKitFolders('mangas');

    // 2. Lấy tất cả manga từ DB
    const allMangas = await Manga.find({}, 'title slug').lean();
    const dbSlugs = allMangas.map(m => m.slug);

    // 3. Lấy distinct mangaName đã có record trong ImageUpload collection
    const dbImageMangaNames: string[] = await ImageUpload.distinct('mangaName');

    // 4. Build các Set để so sánh nhanh
    const imagekitSet = new Set(imagekitMangaSlugs);
    const dbSlugSet = new Set(dbSlugs);
    const dbImageSet = new Set(dbImageMangaNames);

    // ─── Folder "mồ côi": có trên ImageKit nhưng KHÔNG có Manga DB
    const orphanFolders = imagekitMangaSlugs.filter(slug => !dbSlugSet.has(slug));

    // ─── Record DB "mồ côi": có trong ImageUpload DB nhưng KHÔNG có folder IK tương ứng
    const dbOnlyImages = dbImageMangaNames.filter(name => !imagekitSet.has(name));

    // 5. Lấy chi tiết chapter sub-folder trên ImageKit cho mỗi manga slug (song song)
    const imagekitDetails: Record<string, { chapterCount: number; chapters: string[] }> = {};
    await Promise.allSettled(
        imagekitMangaSlugs.map(async (slug) => {
            const chapters = await listImageKitFolders(`mangas/${slug}`);
            imagekitDetails[slug] = { chapterCount: chapters.length, chapters };
        })
    );

    // 6. Đếm chapter trong DB cho mỗi manga
    const chapterCountsAgg = await Chapter.aggregate([
        { $group: { _id: '$manga', count: { $sum: 1 } } }
    ]);
    const mangaIdToSlug: Record<string, string> = {};
    allMangas.forEach(m => { mangaIdToSlug[String(m._id)] = m.slug; });
    const chapterCountMap: Record<string, number> = {};
    chapterCountsAgg.forEach(c => {
        const slug = mangaIdToSlug[String(c._id)];
        if (slug) chapterCountMap[slug] = c.count;
    });

    // 7. Build kết quả chi tiết từng manga
    const mangaDetails = allMangas.map(m => {
        const onImageKit = imagekitSet.has(m.slug);
        const hasDbImages = dbImageSet.has(m.slug);
        const ikInfo = imagekitDetails[m.slug];
        const dbChapterCount = chapterCountMap[m.slug] || 0;
        const ikChapterCount = ikInfo?.chapterCount ?? 0;

        let status: 'synced' | 'no_images' | 'db_only' | 'chapter_mismatch';
        if (!onImageKit && !hasDbImages) {
            status = 'no_images';
        } else if (hasDbImages && !onImageKit) {
            status = 'db_only';
        } else if (onImageKit && dbChapterCount > 0 && dbChapterCount !== ikChapterCount) {
            status = 'chapter_mismatch';
        } else {
            status = 'synced';
        }

        return {
            _id: m._id,
            title: m.title,
            slug: m.slug,
            onImageKit,
            hasDbImages,
            dbChapterCount,
            ikChapterCount,
            ikChapters: ikInfo?.chapters ?? [],
            status,
        };
    });

    const syncedCount = mangaDetails.filter(m => m.status === 'synced').length;
    const noImagesCount = mangaDetails.filter(m => m.status === 'no_images').length;
    const dbOnlyCount = mangaDetails.filter(m => m.status === 'db_only').length;
    const chapterMismatchCount = mangaDetails.filter(m => m.status === 'chapter_mismatch').length;

    res.status(200).json({
        success: true,
        data: {
            summary: {
                totalMangas: allMangas.length,
                imagekitFolderCount: imagekitMangaSlugs.length,
                syncedCount,
                noImagesCount,
                dbOnlyCount,
                chapterMismatchCount,
                orphanFolderCount: orphanFolders.length,
            },
            orphanFolders,
            dbOnlyImages,
            mangaDetails,
        },
    });
});

/**
 * @desc    Xóa folder "mồ côi" trên ImageKit (không có Manga DB tương ứng)
 * @route   DELETE /api/images/sync/orphan/:slug
 * @access  Private/Admin
 */
export const deleteOrphanFolder = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    // Bảo vệ: nếu vẫn còn manga trong DB thì từ chối
    const mangaExists = await Manga.findOne({ slug });
    if (mangaExists) {
        res.status(400).json({
            success: false,
            message: `Manga với slug "${slug}" vẫn còn trong DB. Hãy xóa manga trước.`,
        });
        return;
    }

    try {
        await imagekit.deleteFolder(`mangas/${slug}`);
    } catch (error: any) {
        if (error.statusCode !== 404) {
            res.status(500).json({
                success: false,
                message: `Lỗi khi xóa folder trên ImageKit: ${error.message}`,
            });
            return;
        }
    }

    // Dọn luôn record ImageUpload mồ côi nếu có
    const result = await ImageUpload.deleteMany({ mangaName: slug });

    res.status(200).json({
        success: true,
        message: `Đã xóa folder mồ côi "${slug}" trên ImageKit và ${result.deletedCount} bản ghi DB.`,
    });
});

/**
 * @desc    Xóa bản ghi ImageUpload mồ côi trong DB (có DB record nhưng không có folder IK)
 * @route   DELETE /api/images/sync/db-only/:mangaName
 * @access  Private/Admin
 */
export const deleteDbOnlyRecords = asyncHandler(async (req: Request, res: Response) => {
    const { mangaName } = req.params;

    const result = await ImageUpload.deleteMany({ mangaName });

    res.status(200).json({
        success: true,
        message: `Đã xóa ${result.deletedCount} bản ghi ImageUpload mồ côi của "${mangaName}" trong DB.`,
    });
});
