import apiClient from "./apiClient";

export type ChapterInput = Omit<Chapter, '_id' | 'createdAt' | 'updatedAt'>;

interface ChapterDetailResponse {
    chapter: Chapter;
    totalChapters: number;
}

export const getChaptersByMangaIdAPI = async (mangaId: string): Promise<Chapter[]> => {
    try {
        const response = await apiClient.get(`/chapters/manga/${mangaId}`);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error('Failed to fetch chapters');
    } catch (error) {
        console.error("Error fetching chapters:", error);
        throw error;
    }
};

export const getChapterByIdAPI = async (chapterId: string): Promise<Chapter> => {
    try {
        const response = await apiClient.get(`/chapters/${chapterId}`);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error('Failed to fetch chapter');
    } catch (error) {
        console.error("Error fetching chapter:", error);
        throw error;
    }
}

/**
 * Fetches a single chapter by manga slug and chapter number.
 * @param mangaSlug The slug of the manga.
 * @param chapterNumber The number of the chapter.
 * @returns A promise that resolves to a Chapter object.
 */
export const getChapterByNumberAPI = async (mangaSlug: string, chapterNumber: number): Promise<ChapterDetailResponse> => {
    try {
        // Giả định backend có endpoint dạng này
        const response = await apiClient.get(`/chapters/${mangaSlug}/${chapterNumber}`);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error('Failed to fetch chapter details');
    } catch (error) {
        console.error("Error fetching chapter details:", error);
        throw error;
    }
};

export const createChapterAPI = async (chapterData: ChapterInput): Promise<Chapter> => {
    try {
        const response = await apiClient.post('/chapters', chapterData);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error('Failed to create chapter');
    } catch (error) {
        console.error("Error creating chapter:", error);
        throw error;
    }
};


export const updateChapterAPI = async (chapterId: string, chapterData: Partial<ChapterInput>): Promise<Chapter> => {
    try {
        const response = await apiClient.put(`/chapters/${chapterId}`, chapterData);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error('Failed to update chapter');
    } catch (error) {
        console.error("Error updating chapter:", error);
        throw error;
    }
}

export const deleteChapterAPI = async (chapterId: string): Promise<void> => {
    try {
        const response = await apiClient.delete(`/chapters/${chapterId}`);
        if (response.data && response.data.success) {
            return;
        }
        throw new Error('Failed to delete chapter');
    } catch (error) {
        console.error("Error deleting chapter:", error);
        throw error;
    }
}
