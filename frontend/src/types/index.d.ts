declare global {
    interface Manga {
        _id: string;
        title: string;
        slug: string;
        description?: string;
        status?: 'Ongoing' | 'Completed' | 'Cancelled';
        genres?: (string | Genre)[];
        poster?: string;
        createdAt?: string;
        updatedAt?: string;
    }

    interface Genre {
        _id: string;
        name: string;
        slug: string;
        count?: number;
        description?: string;
        createdAt?: string;
        updatedAt?: string;
    }

    interface UserProfile {
        _id: string;
        supabaseId: string;
        email: string;
        displayName: string;
        avatarUrl?: string;
        role: 'user' | 'admin';
        providers?: 'google' | 'discord';
        createdAt: string;
        updatedAt: string;
    }

    interface ChapterImage {
        url: string;
        pageNumber: number;
    }

    interface Chapter {
        _id: string;
        number: number;
        title: string;
        manga: string;
        images: ChapterImage[];
        createdAt?: string;
        updatedAt?: string;
    }

    interface ImageUpload {
        _id: string;
        secure_url: string;
        public_id: string;
        folder: string;
        mangaName: string;
        createdAt: string; 
        updatedAt: string; 
    }
}

export { };




