import apiClient from "./apiClient";


export const loginAPI = async (data: LoginCredentials): Promise<UserProfile> => {
    try {
        const response = await apiClient.post('/users/login', data);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to login');
        }
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const registerAPI = async (data: RegisterData): Promise<UserProfile> => {
    try {
        const response = await apiClient.post('/users/register', data);
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to register');
        }
    } catch (error) {
        console.error("Error registering:", error);
        throw error;
    }
};

export const logoutAPI = async (): Promise<void> => {
    try {
        await apiClient.post('/users/logout');
    } catch (error) {
        console.error("Error logging out:", error);
        throw error;
    }
};

export const getCurrentUserAPI = async (): Promise<UserProfile> => {
    try {
        const response = await apiClient.get('/users/me');
        
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to get current user profile');
        }
    } catch (error) {
        console.error("Error getting current user:", error);
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

export const updateUserProfileAPI = async (data: UpdateUserProfileData): Promise<UserProfile> => {
    try {
        const response = await apiClient.put('/users/edit-me', data);

        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to update user profile');
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};