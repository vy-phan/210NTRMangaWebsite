import { FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';

const SettingsAdmin = () => {
    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-base-content mb-8">Cài đặt Hệ thống</h2>

            <div className="bg-gradient-to-r from-base-200 to-base-100 p-8 rounded-[2rem] border border-base-300 shadow-inner flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-bold text-base-content">Công cụ cho Nhà phát triển</h3>
                    <p className="text-sm text-base-content/60 max-w-md">Sử dụng Access Token này để xác thực khi sử dụng các công cụ Python Scraper hoặc API bên ngoài.</p>
                </div>
                <button
                    onClick={() => {
                        const token = useAuthStore.getState().token;
                        if (token) {
                            navigator.clipboard.writeText(token);
                            toast.success("Đã sao chép Access Token vào bộ nhớ tạm!");
                        } else {
                            toast.error("Không tìm thấy Access Token. Vui lòng đăng nhập lại.");
                        }
                    }}
                    className="btn btn-primary btn-lg rounded-2xl px-8"
                >
                    <FiLayers className="w-5 h-5" />
                    Sao chép Access Token
                </button>
            </div>
        </div>
    );
};

export default SettingsAdmin;
