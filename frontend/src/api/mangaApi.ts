import apiClient from "./apiClient";


export type MangaInput = Omit<Manga, '_id' | 'createdAt' | 'updatedAt' | 'genres'> & {
    genres: string[];
};

export const getAllMangasAPI = async (): Promise<Manga[]> => {
    try {
        const response = await apiClient.get('/manga');
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch mangas');
        }
    } catch (error) {
        console.error("Error fetching mangas:", error);
        throw error;
    }
};

export const getMangaBySlugAPI = async (slug: string): Promise<Manga> => {
    try {
        const response = await apiClient.get(`/manga/slug/${slug}`);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch manga by slug');
        }
    } catch (error) {
        console.error("Error fetching manga by slug:", error);
        throw error;
    }
}

export const getRelatedMangasAPI = async (currentId: string, genreIds: string[]): Promise<Manga[]> => {
    try {
        const response = await apiClient.post('/manga/related', { currentId, genreIds });
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            return []; 
        }
    } catch (error) {
        console.error("Error fetching related mangas:", error);
        return [];
    }
};

export const getLengthMangasAPI = async (): Promise<number> => {
    try {
        const response = await apiClient.get('/manga/count');
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to get manga count');
        }
    } catch (error) {
        console.error("Error getting manga count:", error);
        throw error;
    }
}

export const getMangaTitleByIdAPI = async (id: string): Promise<{ _id: string; title: string }> => {
    try {
        const response = await apiClient.get(`/manga/${id}/title`);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch manga title');
        }
    } catch (error) {
        console.error("Error fetching manga title:", error);
        throw error;
    }
};


export const createMangaAPI = async (mangaData: MangaInput): Promise<Manga> => {
    try {
        const response = await apiClient.post('/manga', mangaData);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to create manga');
        }
    } catch (error) {
        console.error("Error creating manga:", error);
        throw error;
    }
};


export const updateMangaAPI = async (id: string, mangaData: Partial<MangaInput>): Promise<Manga> => {
    try {
        const response = await apiClient.put(`/manga/${id}`, mangaData);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to update manga');
        }
    } catch (error) {
        console.error("Error updating manga:", error);
        throw error;
    }
};


export const deleteMangaAPI = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/manga/${id}`);
    } catch (error) {
        console.error("Error deleting manga:", error);
        throw error;
    }
};