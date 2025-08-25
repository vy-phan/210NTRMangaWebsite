import { FcGoogle } from 'react-icons/fc';
import { FaDiscord } from 'react-icons/fa';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { useState } from 'react';

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
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-sm shrink-0 shadow-2xl bg-base-100">
                <div className="card-body">
                    <h1 className="text-3xl font-bold text-center">Chào mừng trở lại!</h1>
                    <p className="text-center text-base-content/70 mt-2">
                        Đăng nhập để tiếp tục sử dụng dịch vụ của chúng tôi.
                    </p>
                    <div className="mt-6 flex flex-col gap-4">
                        <button
                            onClick={() => handleLogin('google')}
                            className="btn btn-lg w-full bg-white text-gray-800 hover:bg-gray-50 border border-base-300 group"
                            aria-label="Đăng nhập với Google"
                            disabled={!!loadingProvider}
                        >
                            {loadingProvider === 'google' ? <span className="loading loading-spinner"></span> : <FcGoogle className="text-2xl transition-transform duration-300 group-hover:scale-110" />}
                            <span className="flex-grow text-center">Tiếp tục với Google</span>
                        </button>
                        <button
                            onClick={() => handleLogin('discord')}
                            className="btn btn-lg w-full bg-[#5865F2] text-white hover:bg-[#4752C4] border-0 group"
                            aria-label="Đăng nhập với Discord"
                            disabled={!!loadingProvider}
                        >
                            {loadingProvider === 'discord' ? <span className="loading loading-spinner"></span> : <FaDiscord className="text-2xl transition-transform duration-300 group-hover:scale-110" />}
                            <span className="flex-grow text-center">Tiếp tục với Discord</span>
                        </button>
                    </div>
                    <div className="divider my-6 text-xs text-base-content/50">HOẶC</div>
                    <div className="text-center">
                        <p className="text-sm text-base-content/60">
                            Chưa hỗ trợ đăng nhập bằng email.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;