import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginAPI, registerAPI } from '../../api/authApi';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Vui lòng điền đầy đủ thông tin');
    if (mode === 'register' && !displayName) return toast.error('Vui lòng nhập tên hiển thị');

    try {
      setLoading(true);
      if (mode === 'register') {
        await registerAPI({ email, password, displayName });
        toast.success('Đăng ký thành công!');
        setMode('login');
      } else {
        await loginAPI({ email, password });
        toast.success('Đăng nhập thành công!');
        navigate('/ntr');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link to="/ntr" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-6 transition-colors">
            <FiArrowLeft size={14} /> Quay lại
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink">
            Manga<span className="text-accent">NTR</span>
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {mode === 'login' ? 'Đăng nhập để tiếp tục đọc truyện' : 'Tạo tài khoản miễn phí'}
          </p>
        </div>

        <div className="surface p-5 space-y-4">
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--surface-2)' }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m ? 'text-white' : 'text-ink-muted'
                }`}
                style={{ background: mode === m ? 'var(--accent)' : 'transparent' }}
              >
                {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-ink-muted">Tên hiển thị</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tên của bạn"
                    className="input !pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-muted">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="input !pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-muted">Mật khẩu</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input !pl-10 !pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                  aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPw ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý…
                </span>
              ) : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-ink-muted">
          Bằng cách đăng nhập, bạn đồng ý với điều khoản sử dụng của chúng tôi.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
