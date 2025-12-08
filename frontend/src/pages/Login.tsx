import { FcGoogle } from 'react-icons/fc';
import { FaDiscord } from 'react-icons/fa';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    const [loadingProvider, setLoadingProvider] = useState<'google' | 'discord' | null>(null);

    const handleLogin = async (provider: 'google' | 'discord') => {
        setLoadingProvider(provider);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin,
                },
            });

            if (error) {
                throw error;
            }
        } catch (error: any) {
            console.error(`Error logging in with ${provider}:`, error);
            toast.error(error.message || `Đăng nhập với ${provider} thất bại.`);
            setLoadingProvider(null);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-base-100 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                
                {/* === CỘT TRÁI: ẢNH COVER (Chỉ hiện trên màn hình lớn) === */}
                <div className="relative hidden lg:block h-full">
                    {/* Ảnh nền */}
                    <img 
                        src="/cover.png" 
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
                            <h1 className="text-3xl font-extrabold text-base-content mb-2">Chào mừng trở lại! 👋</h1>
                            <p className="text-base-content/60">
                                Vui lòng đăng nhập bằng tài khoản của bạn.
                            </p>
                        </div>

                        {/* Các nút đăng nhập */}
                        <div className="flex flex-col gap-4">
                            {/* Nút Google */}
                            <button
                                onClick={() => handleLogin('google')}
                                className="btn btn-lg w-full bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-300 shadow-sm transition-all duration-300 transform hover:-translate-y-1"
                                disabled={!!loadingProvider}
                            >
                                {loadingProvider === 'google' ? (
                                    <span className="loading loading-spinner text-primary"></span>
                                ) : (
                                    <FcGoogle className="text-2xl" />
                                )}
                                <span className="flex-grow text-center font-semibold">Đăng nhập với Google</span>
                            </button>

                            {/* Nút Discord */}
                            <button
                                onClick={() => handleLogin('discord')}
                                className="btn btn-lg w-full bg-[#5865F2] text-white hover:bg-[#4752C4] border-none shadow-md shadow-[#5865F2]/30 transition-all duration-300 transform hover:-translate-y-1"
                                disabled={!!loadingProvider}
                            >
                                {loadingProvider === 'discord' ? (
                                    <span className="loading loading-spinner text-white"></span>
                                ) : (
                                    <FaDiscord className="text-2xl" />
                                )}
                                <span className="flex-grow text-center font-semibold">Đăng nhập với Discord</span>
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
                            Chưa muốn đăng nhập ngay? <Link to="/" className="link link-primary font-semibold hover:underline">Về trang chủ</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;