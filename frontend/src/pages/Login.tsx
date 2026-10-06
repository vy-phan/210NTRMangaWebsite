import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI, registerAPI } from '../api/authApi';
import { ASSETS } from '../constants/assets';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Login = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLoginMode) {
                const user = await loginAPI({ email, password });
                setUser(user, user.token || null);
                toast.success(`Chào mừng trở lại, ${user.displayName}!`);
                navigate('/');
            } else {
                const user = await registerAPI({ email, password, displayName });
                setUser(user, user.token || null);
                toast.success(`Đăng ký thành công, chào mừng ${user.displayName}!`);
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-base-100 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

                {/* === CỘT TRÁI: ẢNH COVER (Chỉ hiện trên màn hình lớn) === */}
                <div className="relative hidden lg:block h-full">
                    {/* Ảnh nền */}
                    <img
                        src={ASSETS.AUTH_COVER}
                        alt="Login Cover"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Lớp phủ Gradient: Giúp chữ hiển thị rõ trên mọi loại ảnh */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                    {/* Nội dung trên ảnh */}
                    <div className="absolute bottom-0 left-0 p-10 text-white z-10">
                        <h2 className="text-4xl font-bold mb-4">NTR Manga Đăng Nhập</h2>
                        <p className="text-gray-200 text-lg opacity-90">
                            Đâng nhập để trải nghiệm nhiều tính năng hay ho
                        </p>
                    </div>
                </div>

                {/* === CỘT PHẢI: FORM ĐĂNG NHẬP === */}
                <div className="flex flex-col justify-center p-8 md:p-14 lg:p-16">
                    <div className="w-full max-w-md mx-auto">

                        {/* Header của form */}
                        <div className="mb-8 text-center lg:text-left">
                            <h1 className="text-3xl font-extrabold text-base-content mb-2">
                                {isLoginMode ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới'}
                            </h1>
                            <p className="text-base-content/60">
                                {isLoginMode ? 'Vui lòng đăng nhập bằng tài khoản của bạn.' : 'Điền thông tin để đăng ký.'}
                            </p>
                        </div>

                        {/* Form đăng nhập / đăng ký */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            {!isLoginMode && (
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-medium">Tên hiển thị</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nhập tên hiển thị"
                                        className="input input-bordered w-full"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required={!isLoginMode}
                                    />
                                </div>
                            )}

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Email</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="email@example.com"
                                    className="input input-bordered w-full"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Mật khẩu</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="input input-bordered w-full"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-4"
                                disabled={loading}
                            >
                                {loading && <span className="loading loading-spinner"></span>}
                                {isLoginMode ? 'Đăng nhập' : 'Đăng ký'}
                            </button>
                        </form>

                        <div className="mt-4 text-center text-sm">
                            <button
                                type="button"
                                onClick={() => setIsLoginMode(!isLoginMode)}
                                className="link link-hover text-primary font-medium"
                            >
                                {isLoginMode ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-base-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-base-100 text-base-content/50 uppercase font-medium">Hoặc</span>
                            </div>
                        </div>

                        {/* Footer Link */}
                        <div className="text-center text-sm text-base-content/60">
                            Chưa muốn tham gia ngay? <Link to="/" className="link link-primary font-semibold hover:underline">Về trang chủ</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;