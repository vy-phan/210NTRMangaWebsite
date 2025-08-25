import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { FiEdit, FiShield } from 'react-icons/fi';

const Profile = () => {
  // 1. Lấy thông tin user và trạng thái loading từ Zustand store
  const { user, isLoading } = useAuthStore();

  // 2. Xử lý trạng thái đang tải
  // Quan trọng để đợi AuthListener kiểm tra session khi tải lại trang
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // 3. Xử lý trường hợp người dùng chưa đăng nhập nhưng cố vào trang
  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-error">Bạn cần đăng nhập để xem trang này.</h1>
        <Link to="/login" className="btn btn-primary mt-4">Đi đến trang Đăng nhập</Link>
      </div>
    );
  }

  // 4. Giao diện chính khi đã có dữ liệu người dùng
  return (
    <div className="bg-base-200 min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            
            {/* Avatar */}
            <div className="avatar mb-4">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
                <img 
                  src={user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${user.displayName}`}
                  alt="User Avatar"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Tên và Vai trò */}
            <h2 className="card-title text-3xl">{user.displayName}</h2>
            {user.role === 'admin' && (
              <div className="badge badge-primary gap-1">
                <FiShield size={12} />
                Quản trị viên
              </div>
            )}
             {user.role === 'user' && (
              <div className="badge badge-ghost">
                Thành viên
              </div>
            )}
            
            {/* Dấu ngăn cách */}
            <div className="divider my-6">Thông tin chi tiết</div>

            {/* Bảng thông tin */}
            <div className="w-full text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-base-content/70">Email:</span>
                <span className="font-semibold">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Nhà cung cấp:</span>
                <span className="font-semibold capitalize">{user.providers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Ngày tham gia:</span>
                <span className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            {/* Các nút hành động */}
            <div className="card-actions justify-center mt-8">
              <button className="btn btn-outline" disabled>
                <FiEdit />
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;