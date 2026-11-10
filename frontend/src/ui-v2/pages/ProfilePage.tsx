import React, { useEffect, useState } from 'react';
import { getCurrentUserAPI, logoutAPI } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiUser, FiMail, FiShield, FiLogOut } from 'react-icons/fi';
import SectionHeader from '../components/SectionHeader';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setUser(await getCurrentUserAPI());
      } catch (err) {
        console.error('Lỗi tải thông tin cá nhân:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAPI();
      toast.success('Đã đăng xuất');
      navigate('/ntr/login');
    } catch {
      toast.error('Đăng xuất thất bại');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-ink-muted animate-pulse">Đang tải hồ sơ…</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
      <SectionHeader title="Tài khoản" />
      <div className="surface p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          >
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <FiUser />}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-ink truncate">{user?.displayName || 'Người dùng'}</h1>
            <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5 truncate">
              <FiMail size={12} /> {user?.email}
            </p>
          </div>
        </div>

        <div className="rounded-xl p-4 space-y-2.5" style={{ background: 'var(--surface-2)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <FiShield size={12} /> Quyền hạn
            </span>
            <span className="font-semibold text-accent capitalize">{user?.role || 'user'}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">ID tài khoản</span>
            <span className="font-mono text-ink-muted truncate ml-4">{user?._id}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-ghost w-full text-danger">
          <FiLogOut size={15} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
