import apiClient from "./apiClient";

export type BannerInput = Omit<Banner, '_id' | 'createdAt' | 'updatedAt'>;


/**
 * Lấy danh sách banner đang Active để hiển thị ở trang chủ
 */
export const getBannersAPI = async (): Promise<Banner[]> => {
    try {
        const response = await apiClient.get('/banners');
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch public banners');
        }
    } catch (error) {
        console.error("Error fetching public banners:", error);
        throw error;
    }
};



/**
 * Lấy TẤT CẢ banner (kể cả ẩn) cho admin quản lý
 */
export const getAllBannersAdminAPI = async (): Promise<Banner[]> => {
    try {
        const response = await apiClient.get('/banners/admin/all');
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch all banners for admin');
        }
    } catch (error) {
        console.error("Error fetching admin banners:", error);
        throw error;
    }
};

/**
 * Lấy chi tiết 1 banner theo ID (để edit)
 */
export const getBannerByIdAPI = async (id: string): Promise<Banner> => {
    try {
        const response = await apiClient.get(`/banners/${id}`);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch banner by ID');
        }
    } catch (error) {
        console.error("Error fetching banner by ID:", error);
        throw error;
    }
};

/**
 * Tạo banner mới
 */
export const createBannerAPI = async (bannerData: BannerInput): Promise<Banner> => {
    try {
        const response = await apiClient.post('/banners', bannerData);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to create banner');
        }
    } catch (error) {
        console.error("Error creating banner:", error);
        throw error;
    }
};

/**
 * Cập nhật banner (dùng Partial để có thể update từng phần như chỉ active/inactive)
 */
export const updateBannerAPI = async (id: string, bannerData: Partial<BannerInput>): Promise<Banner> => {
    try {
        const response = await apiClient.put(`/banners/${id}`, bannerData);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to update banner');
        }
    } catch (error) {
        console.error("Error updating banner:", error);
        throw error;
    }
};

/**
 * Xóa banner
 */
export const deleteBannerAPI = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/banners/${id}`);
    } catch (error) {
        console.error("Error deleting banner:", error);
        throw error;
    }
};