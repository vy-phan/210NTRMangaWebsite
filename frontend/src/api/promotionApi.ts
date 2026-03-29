import apiClient from "./apiClient";

export const getPromotionsAPI = async (category?: string): Promise<Promotion[]> => {
    try {
        const response = await apiClient.get('/promotions', { params: { category } });
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return [];
    }
};

export const createPromotionAPI = async (data: Partial<Promotion>): Promise<Promotion> => {
    const response = await apiClient.post('/promotions', data);
    return response.data.data;
};

export const updatePromotionAPI = async (id: string, data: Partial<Promotion>): Promise<Promotion> => {
    const response = await apiClient.put(`/promotions/${id}`, data);
    return response.data.data;
};

export const deletePromotionAPI = async (id: string): Promise<void> => {
    await apiClient.delete(`/promotions/${id}`);
};
