import apiClient from "./apiClient";


/**
 * Uploads one or more image files for a specific manga.
 * @param {string} mangaName - The name of the manga (used for folder creation).
 * @param {FileList | File[]} files - The list of files to upload from an <input type="file">.
 * @returns {Promise<ImageUpload[]>} A promise that resolves to an array of uploaded image data.
 */
export const uploadImagesAPI = async (mangaName: string, files: FileList | File[], chapter?: number | string): Promise<ImageUpload[]> => {
    const formData = new FormData();
    formData.append('mangaName', mangaName);
    if (chapter !== undefined) {
        formData.append('chapter', chapter.toString());
    }
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
    }

    try {
        const response = await apiClient.post('/images/upload', formData);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to upload images');
    } catch (error) {
        console.error("Error uploading images:", error);
        throw error;
    }
};


/**
 * Fetches all images associated with a specific manga name.
 * @param {string} mangaName - The name of the manga to search for.
 * @returns {Promise<ImageUpload[]>} A promise that resolves to an array of images.
 */
export const getImagesByMangaNameAPI = async (mangaName: string): Promise<ImageUpload[]> => {
    try {
        const response = await apiClient.get(`/images/manga/${mangaName}`);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch images by manga name');
    } catch (error) {
        console.error("Error fetching images by manga name:", error);
        throw error;
    }
};


/**
 * Deletes a single image by its MongoDB _id.
 * @param {string} imageId - The _id of the image to delete.
 * @returns {Promise<void>} A promise that resolves when deletion is successful.
 */
export const deleteImageAPI = async (imageId: string): Promise<void> => {
    try {
        const response = await apiClient.delete(`/images/${imageId}`);
        // Hàm xóa thường chỉ trả về message, không có data
        if (response.data && response.data.success) {
            return; // Thành công
        }
        throw new Error(response.data.message || 'Failed to delete image');
    } catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
};

/**
 * Deletes all images belonging to a specific chapter folder.
 * @param {string} mangaName 
 * @param {string|number} chapter 
 */
export const deleteChapterImagesAPI = async (mangaName: string, chapter: string | number): Promise<void> => {
    try {
        const response = await apiClient.post('/images/delete-chapter', { mangaName, chapter });
        if (response.data && response.data.success) {
            return;
        }
        throw new Error(response.data.message || 'Failed to delete chapter images');
    } catch (error) {
        console.error("Error deleting chapter images:", error);
        throw error;
    }
};

/**
 * Deletes all images belonging to a specific manga.
 * @param {string} mangaName 
 */
export const deleteMangaFolderAPI = async (mangaName: string): Promise<void> => {
    try {
        const response = await apiClient.post('/images/delete-manga', { mangaName });
        if (response.data && response.data.success) {
            return;
        }
        throw new Error(response.data.message || 'Failed to delete manga folder');
    } catch (error) {
        console.error("Error deleting manga folder:", error);
        throw error;
    }
};

// ─── Storage Sync API ───────────────────────────────────────────────────────

export interface MangaSyncDetail {
    _id: string;
    title: string;
    slug: string;
    onImageKit: boolean;
    hasDbImages: boolean;
    dbChapterCount: number;
    ikChapterCount: number;
    ikChapters: string[];
    status: 'synced' | 'no_images' | 'db_only' | 'chapter_mismatch';
}

export interface SyncStatusResponse {
    summary: {
        totalMangas: number;
        imagekitFolderCount: number;
        syncedCount: number;
        noImagesCount: number;
        dbOnlyCount: number;
        chapterMismatchCount: number;
        orphanFolderCount: number;
    };
    orphanFolders: string[];
    dbOnlyImages: string[];
    mangaDetails: MangaSyncDetail[];
}

/**
 * Lấy trạng thái đồng bộ storage ImageKit vs MongoDB
 */
export const getSyncStatusAPI = async (): Promise<SyncStatusResponse> => {
    const response = await apiClient.get('/images/sync-status');
    if (response.data?.success) return response.data.data;
    throw new Error(response.data?.message || 'Failed to fetch sync status');
};

/**
 * Xóa folder "mồ côi" trên ImageKit (không có manga DB tương ứng)
 */
export const deleteOrphanFolderAPI = async (slug: string): Promise<string> => {
    const response = await apiClient.delete(`/images/sync/orphan/${slug}`);
    if (response.data?.success) return response.data.message;
    throw new Error(response.data?.message || 'Failed to delete orphan folder');
};

/**
 * Xóa bản ghi ImageUpload "mồ côi" trong DB
 */
export const deleteDbOnlyRecordsAPI = async (mangaName: string): Promise<string> => {
    const response = await apiClient.delete(`/images/sync/db-only/${mangaName}`);
    if (response.data?.success) return response.data.message;
    throw new Error(response.data?.message || 'Failed to delete db-only records');
};