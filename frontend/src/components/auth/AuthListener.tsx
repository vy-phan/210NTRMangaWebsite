import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { getCurrentUserAPI, syncUserProfileAPI } from '../../api/authApi';

const AuthListener = () => {
    const navigate = useNavigate();
    const { setUser, logout, setLoading } = useAuthStore();

    // useRef để đảm bảo việc đồng bộ profile chỉ chạy MỘT LẦN khi app khởi động
    const isInitialLoad = useRef(true);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = useAuthStore.getState().user;

            if (event === 'TOKEN_REFRESHED' && session) {
                console.log("Token has been refreshed!");
                // Cập nhật lại token mới vào Zustand store
                useAuthStore.setState({ token: session.access_token });
            }

            const syncAndFetchCustomProfile = async (token: string) => {
                const baseProfile = await syncUserProfileAPI(token);
                const freshUserData = await getCurrentUserAPI();

                // Bước 3: Merge dữ liệu
                const mergedUser = {
                    ...baseProfile,
                    displayName: freshUserData.displayName,
                    avatarUrl: freshUserData.avatarUrl,
                    updatedAt: freshUserData.updatedAt
                };

                return mergedUser;
            };

            // === TRƯỜNG HỢP 1: NGƯỜI DÙNG ĐĂNG NHẬP THÀNH CÔNG (lần đầu qua OAuth) ===
            // Điều kiện `!currentUser` đảm bảo logic này chỉ chạy khi chưa có user trong store,
            // tức là ngay sau khi hoàn tất OAuth redirect.
            if (event === 'SIGNED_IN' && session && !currentUser) {
                const token = session.access_token;
                useAuthStore.setState({ token });

                const loadingToast = toast.loading('Đang đồng bộ tài khoản...');
                try {
                    const finalUser = await syncAndFetchCustomProfile(token);

                    setUser(finalUser, token);
                    toast.dismiss(loadingToast);
                    toast.success(`Chào mừng trở lại, ${finalUser.displayName}!`);

                    navigate('/');

                } catch (error) {
                    toast.dismiss(loadingToast);
                    toast.error('Đồng bộ tài khoản thất bại. Vui lòng thử lại.');
                    await supabase.auth.signOut();
                    logout();
                }
                return; // Kết thúc sớm để không chạy vào logic bên dưới
            }

            // === TRƯỜNG HỢP 2: TẢI LẠI TRANG HOẶC MỞ LẠI TAB ===
            // `INITIAL_SESSION` được kích hoạt khi app load và có session sẵn.
            // `isInitialLoad.current` đảm bảo nó chỉ chạy một lần duy nhất.
            if (event === 'INITIAL_SESSION' && session && isInitialLoad.current) {
                isInitialLoad.current = false; // Đánh dấu đã chạy lần đầu
                const token = session.access_token;

                // Kiểm tra xem user trong store đã có chưa. Nếu chưa, mới fetch
                if (!currentUser) {
                    try {
                        // Cập nhật token và user profile mà KHÔNG chuyển hướng
                        useAuthStore.setState({ token, isLoading: true });
                        const userProfile = await syncUserProfileAPI(token);
                        setUser(userProfile, token);
                    } catch (error) {
                        // Nếu token cũ nhưng không sync được, đăng xuất
                        await supabase.auth.signOut();
                        logout();
                    }
                } else {
                    // Nếu user đã có sẵn trong store (từ persist), chỉ cần tắt loading
                    setLoading(false);
                }
            }

            // Nếu không có session khi khởi động, tắt loading
            if (event === 'INITIAL_SESSION' && !session && isInitialLoad.current) {
                isInitialLoad.current = false;
                setLoading(false);
            }

            // === TRƯỜNG HỢP 3: ĐĂNG XUẤT ===
            if (event === 'SIGNED_OUT') {
                logout();
                toast.success('Đã đăng xuất!');
                navigate('/login');
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [setUser, logout, navigate, setLoading]);

    return null;
};

export default AuthListener;