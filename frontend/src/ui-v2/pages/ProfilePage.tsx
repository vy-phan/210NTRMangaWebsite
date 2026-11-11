import React, { useEffect } from 'react';
import { logoutAPI } from '../../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiMail, FiShield, FiLogOut } from 'react-icons/fi';
import SectionHeader from '../components/SectionHeader';
import UserAvatar from '../components/UserAvatar';
import { useAuthStore } from '../lib/auth';

const ProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const loaded = useAuthStore((s) => s.loaded);
  const fetchUser = useAuthStore((s) => s.fetch);
  const clearUser = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loaded) fetchUser();
  }, [loaded, fetchUser]);

  const handleLogout = async () => {
    try {
      await logoutAPI();
      clearUser();
      toast.success('Đã đăng xuất');
      navigate('/ntr/login');
    } catch {
      toast.error('Đăng xuất thất bại');
    }
  };

  if (!loaded) {
    return <div className="py-20 text-center text-sm text-ink-muted animate-pulse">Đang tải hồ sơ…</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
      <SectionHeader title="Tài khoản" />
      <div className="surface p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size={64} className="text-2xl font-bold" />
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold text-ink truncate">
              {user?.displayName || 'Khách'}
            </h1>
            <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5 truncate">
              <FiMail size={12} /> {user?.email || 'Chưa đăng nhập'}
            </p>
          </div>
        </div>

        {user ? (
          <>
            <div className="rounded-xl p-4 space-y-2.5" style={{ background: 'var(--surface-2)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <FiShield size={12} /> Quyền hạn
                </span>
                <span className="font-semibold text-accent capitalize">{user.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-muted">ID tài khoản</span>
                <span className="font-mono text-ink-muted truncate ml-4">{user._id}</span>
              </div>
            </div>

            <button onClick={handleLogout} className="btn-ghost w-full text-danger">
              <FiLogOut size={15} /> Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/ntr/login" className="btn-primary w-full">
            Đăng nhập / Đăng ký
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
