import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const AdminRouteGuard = () => {
    // 1. Lấy thông tin user và trạng thái loading từ Zustand store
    const { user, isLoading } = useAuthStore();

    // 2. Xử lý trạng thái đang tải (quan trọng!)
    // Trong khi app đang kiểm tra session, chúng ta hiển thị một màn hình loading
    // để tránh việc người dùng bị "đá" ra trang login một cách đột ngột.
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    // 3. Kiểm tra quyền truy cập sau khi đã tải xong
    // Nếu có user VÀ user đó có vai trò là 'admin'
    if (user && user.role === 'admin') {
        // Cho phép render các route con được bọc bên trong
        return <Outlet />;
    }
    
    // 4. Nếu không đủ điều kiện, chuyển hướng người dùng
    // `replace` sẽ thay thế trang hiện tại trong lịch sử duyệt web,
    // người dùng sẽ không thể bấm "Back" để quay lại trang admin.
    if (!user) {
        // Nếu chưa đăng nhập, chuyển về trang login
        return <Navigate to="/login" replace />;
    } else {
        // Nếu đã đăng nhập nhưng không phải admin, chuyển về trang chủ (hoặc trang 404)
        return <Navigate to="/" replace />;
    }
};

export default AdminRouteGuard;