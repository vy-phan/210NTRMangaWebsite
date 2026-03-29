import apiClient from "./apiClient";

export type CreateReportInput = Omit<ChapterReport, '_id' | 'createdAt' | 'updatedAt' | 'status' | 'ipAddress'>;

/**
 * Gửi báo cáo lỗi mới
 */
export const createReportAPI = async (reportData: CreateReportInput): Promise<ChapterReport> => {
    try {
        const response = await apiClient.post('/reports', reportData);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Gửi báo cáo thất bại');
        }
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message || 'Gửi báo cáo thất bại';
        throw new Error(msg);
    }
};

/**
 * Lấy tất cả báo cáo lỗi (Có kèm dữ liệu chi tiết - Dùng cho Admin)
 */
export const getAllReportsAPI = async (): Promise<PopulatedChapterReport[]> => {
    try {
        const response = await apiClient.get('/reports');
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Lấy danh sách báo cáo thất bại');
        }
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message || 'Lấy danh sách báo cáo thất bại';
        throw new Error(msg);
    }
};

/**
 * Cập nhật trạng thái báo cáo (Dùng cho Admin)
 */
export const updateReportStatusAPI = async (id: string, status: ReportStatus): Promise<ChapterReport> => {
    try {
        const response = await apiClient.patch(`/reports/${id}`, { status });
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Cập nhật trạng thái thất bại');
        }
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message || 'Cập nhật trạng thái thất bại';
        throw new Error(msg);
    }
};

/**
 * Xóa báo cáo lỗi (Dùng cho Admin - Chỉ xóa khi đã Fixed/Rejected)
 */
export const deleteReportAPI = async (id: string): Promise<void> => {
    try {
        const response = await apiClient.delete(`/reports/${id}`);
        if (!response.data || !response.data.success) {
            throw new Error(response.data.message || 'Xóa báo cáo thất bại');
        }
    } catch (error: any) {
        const msg = error.response?.data?.message || error.message || 'Xóa báo cáo thất bại';
        throw new Error(msg);
    }
};
