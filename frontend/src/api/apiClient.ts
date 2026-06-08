import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
  withCredentials: true,
});

// Interceptor cho Request (không cần gửi Authorization header nữa vì dùng cookie)
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho Response (xử lý token hết hạn)
apiClient.interceptors.response.use(
  (response) => response, // Nếu thành công thì không làm gì
  async (error) => {
    // Chỉ xử lý khi có lỗi 401
    if (error.response && error.response.status === 401) {
      const { user, token, logout } = useAuthStore.getState();
      
      // Chỉ hiển thị thông báo và logout nếu người dùng đã đăng nhập trước đó
      if (user || token) {
        // Kiểm tra xem đã có thông báo lỗi 401 nào chưa để tránh spam
        if (!document.querySelector('.toast-401-error')) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
            id: 'toast-401-error', // Gán ID để tránh lặp lại
          });
        }
        
        // Đăng xuất người dùng
        logout();
      }
      
    }
    return Promise.reject(error);
  }
);

export default apiClient;