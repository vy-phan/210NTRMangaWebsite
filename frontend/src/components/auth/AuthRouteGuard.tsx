import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const AuthRouteGuard = () => {
    const { user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }
    
    // Nếu đã tải xong và có user, cho phép vào
    if (user) {
        return <Outlet />;
    }

    return <Navigate to="/login" replace />;
};

export default AuthRouteGuard;