declare global {
    interface HistoryItem {
        mangaId: string;
        mangaTitle: string;
        mangaSlug: string;
        mangaPoster: string;
        chapterId: string;
        chapterNumber: number;
        chapterTitle: string;
        readAt: number;
    }

    interface Manga {
        _id: string;
        title: string;
        slug: string;
        description?: string;
        status?: 'Ongoing' | 'Completed' | 'Cancelled';
        category?: 'Manga' | 'Manhwa';
        genres?: (string | Genre)[];
        poster?: string;
        author?: string;
        artist?: string;
        externalUrl?: string;
        createdAt?: string;
        updatedAt?: string;
        latestChapters?: ChapterPreview[];
    }

    interface Banner {
        _id: string;
        title: string;
        bannerImg: string;
        charImg: string;
        link: string;
        active: boolean;
        priority: number;
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
        email: string;
        displayName: string;
        avatarUrl?: string;
        role: 'user' | 'admin';
        token?: string;
        createdAt: string;
        updatedAt: string;
    }

    interface LoginCredentials {
        email: string;
        password: string;
    }

    interface RegisterData {
        email: string;
        password: string;
        displayName: string;
    }

    interface UpdateUserProfileData {
        displayName?: string;
        avatarUrl?: string;
    }

    interface ChapterImage {
        url: string;
        pageNumber: number;
    }

    interface ChapterPreview {
        _id: string;
        number: number;
        title: string;
        createdAt?: string;
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

    interface Promotion {
        _id: string;
        title: string;
        image: string;
        link: string;
        views?: string;
        active: boolean;
        priority: number;
        createdAt?: string;
        updatedAt?: string;
    }

    interface Notification {
        _id: string;
        content: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }

    type ErrorType = 'image_broken' | 'wrong_order' | 'missing_pages' | 'wrong_manga' | 'other';
    type ReportStatus = 'pending' | 'fixed' | 'rejected';

    interface ChapterReport {
        _id: string;
        mangaId: string;
        chapterId: string;
        reporter: string | null;
        errorType: ErrorType;
        description: string;
        status: ReportStatus;
        ipAddress?: string;
        createdAt: string;
        updatedAt: string;
    }

    // Type cho dữ liệu đã populate (Dùng cho Admin)
    interface PopulatedChapterReport extends Omit<ChapterReport, 'mangaId' | 'chapterId' | 'reporter'> {
        mangaId: {
            _id: string;
            title: string;
        };
        chapterId: {
            _id: string;
            number: number;
            title: string;
        };
        reporter: {
            _id: string;
            displayName: string;
            email: string;
        } | null;
    }
}

export { };




