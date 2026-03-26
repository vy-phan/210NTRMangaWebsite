import apiClient from "./apiClient";

export interface Notification {
    _id: string;
    content: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


/**
 * @desc    Get the currently active notification for the website
 * @returns Latest active notification or null
 */
export const getActiveNotificationAPI = async (): Promise<Notification | null> => {
    try {
        const response = await apiClient.get('/notifications/active');
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching active notification:", error);
        return null;
    }
};

/**
 * @desc    Get all notifications (Admin only)
 */
export const getAllNotificationsAPI = async (): Promise<Notification[]> => {
    try {
        const response = await apiClient.get('/notifications');
        if (response.data && response.data.success) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        throw error;
    }
};

/**
 * @desc    Create a new notification (Admin only)
 */
export const createNotificationAPI = async (data: Partial<Notification>): Promise<Notification> => {
    try {
        const response = await apiClient.post('/notifications', data);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error("Failed to create notification");
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

/**
 * @desc    Update a notification (Admin only)
 */
export const updateNotificationAPI = async (id: string, data: Partial<Notification>): Promise<Notification> => {
    try {
        const response = await apiClient.put(`/notifications/${id}`, data);
        if (response.data && response.data.success) {
            return response.data.data;
        }
        throw new Error("Failed to update notification");
    } catch (error) {
        console.error("Error updating notification:", error);
        throw error;
    }
};

/**
 * @desc    Delete a notification (Admin only)
 */
export const deleteNotificationAPI = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
};
