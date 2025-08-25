import apiClient from "./apiClient";

type GenreInput = Omit<Genre, '_id' | 'createdAt' | 'updatedAt'>;

interface GenreDetailResponse {
    genre: Genre;
    mangas: Manga[];
}

export const getAllGenresAPI = async (): Promise<Genre[]> => {
    try {
        const response = await apiClient.get('/genres');
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch genres');
        }
    } catch (error) {
        console.error("Error fetching genres:", error);
        throw error;
    }
};

export const getGenreBySlugAPI = async (slug: string): Promise<GenreDetailResponse> => {
    try {
        const response = await apiClient.get(`/genres/${slug}`);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch genre');
        }
    } catch (error) {
        console.error("Error fetching genre by slug:", error);
        throw error;
    }
}

export const getLengthGenresAPI = async (): Promise<number> => {
    try {
        const response = await apiClient.get('/genres/count');
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to get genre count');
        }
    } catch (error) {
        console.error("Error getting genre count:", error);
        throw error;
    }
}

export const createGenreAPI = async (genreData: Omit<GenreInput, 'slug'>): Promise<Genre> => {
    try {
        const response = await apiClient.post('/genres', genreData);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to create genre');
        }
    } catch (error) {
        console.error("Error creating genre:", error);
        throw error;
    }
};

export const updateGenreAPI = async (id: string, genreData: Partial<Omit<GenreInput, 'slug'>>): Promise<Genre> => {
    try {
        const response = await apiClient.put(`/genres/${id}`, genreData);
        if (response.data && response.data.success) {
            return response.data.data; // Backend thường trả về data đã update
        } else {
            throw new Error(response.data.message || 'Failed to update genre');
        }
    } catch (error) {
        console.error("Error updating genre:", error);
        throw error;
    }
};


export const deleteGenreAPI = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/genres/${id}`);
    } catch (error) {
        console.error("Error deleting genre:", error);
        throw error;
    }
};