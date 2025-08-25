import apiClient from "./apiClient";


export const syncUserProfileAPI = async (token: string): Promise<UserProfile> => {
    try {
        const response = await apiClient.post('/users/sync', 
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to sync user profile');
        }
    } catch (error) {
        console.error("Error syncing user profile:", error);
        throw error;
    }
};

export const getLengthUsersAPI = async (): Promise<number> => {
    try {
        const response = await apiClient.get('/users/count');
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to get user count');
        }
    } catch (error) {
        console.error("Error getting user count:", error);
        throw error;
    }
}