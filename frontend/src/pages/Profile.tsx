import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { FiEdit, FiShield } from 'react-icons/fi';
import { getCurrentUserAPI, updateUserProfileAPI } from '../api/authApi';
import AvatarSelectionModal from '../components/auth/AvatarSelectionModal';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, token, isLoading, setUser } = useAuthStore();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenModal = () => {
    modalRef.current?.showModal();
  };


  const handleSaveProfile = async (newAvatarUrl: string, newDisplayName: string) => {
    if (!user || !token) return;

    setIsUpdating(true);

    try {
      const updateData: { avatarUrl?: string; displayName?: string } = {};

      if (newAvatarUrl !== user.avatarUrl) updateData.avatarUrl = newAvatarUrl;
      if (newDisplayName !== user.displayName) updateData.displayName = newDisplayName;


      if (Object.keys(updateData).length === 0) {
        setIsUpdating(false);
        return;
      }


      await updateUserProfileAPI(updateData);
      const freshUserData = await getCurrentUserAPI();
      const mergedUser = {
        ...user,
        displayName: freshUserData.displayName,
        avatarUrl: freshUserData.avatarUrl,
        updatedAt: freshUserData.updatedAt
      };

      setUser(mergedUser, token);
      toast.success("Cập nhật thành công!");

    } catch (error) {
      console.error("Lỗi update:", error);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- UI RENDERING (Không thay đổi) ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-error">Bạn cần đăng nhập để xem trang này.</h1>
        <Link to="/login" className="btn btn-primary mt-4">Đi đến trang Đăng nhập</Link>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen p-4 md:p-8">
      {/* Overlay Loading */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <div className="container mx-auto max-w-2xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">

            {/* Avatar */}
            <div className="avatar mb-4">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4 overflow-hidden" style={{
                borderRadius: '50%',
                border: '2px solid var(--p)',
                padding: '4px',
                backgroundColor: 'var(--b1)',
                overflow: 'hidden'
              }}>
                <img
                  src={user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${user.displayName}`}
                  alt="User Avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  style={{
                    borderRadius: '50%',
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                  }}
                />
              </div>
            </div>

            {/* Display Name */}
            <h2 className="card-title text-3xl">{user.displayName}</h2>
            {user.role === 'admin' && (
              <div className="badge badge-primary gap-1">
                <FiShield size={12} /> Quản trị viên
              </div>
            )}
            {user.role === 'user' && (
              <div className="badge badge-ghost">Thành viên</div>
            )}

            <div className="divider my-6">Thông tin chi tiết</div>

            <div className="w-full text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-base-content/70">Email:</span>
                <span className="font-semibold">{user.email}</span>
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

            <div className="card-actions justify-center mt-8">
              <button
                onClick={handleOpenModal}
                className="btn btn-outline"
                disabled={isUpdating}
              >
                <FiEdit /> Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>

      <AvatarSelectionModal
        modalRef={modalRef}
        currentAvatar={user.avatarUrl || ''}
        currentName={user.displayName || ''}
        onSave={handleSaveProfile}
      />

    </div>
  );
};

export default Profile;