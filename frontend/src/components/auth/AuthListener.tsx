import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { getCurrentUserAPI } from '../../api/authApi';

const AuthListener = () => {
    const { setUser, logout, setLoading } = useAuthStore();
    const isInitialLoad = useRef(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (isInitialLoad.current) {
                isInitialLoad.current = false;
                try {
                    const user = await getCurrentUserAPI();
                    const currentToken = useAuthStore.getState().token;
                    setUser(user, currentToken || 'cookie_token');
                } catch (error) {
                    logout();
                } finally {
                    setLoading(false);
                }
            }
        };

        checkAuth();
    }, [setUser, logout, setLoading]);

    return null;
};

export default AuthListener;