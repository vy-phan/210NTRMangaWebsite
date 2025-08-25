import { useEffect } from 'react';

/**
 * Một custom hook để lắng nghe sự kiện nhấn phím.
 * @param key - Phím cần lắng nghe (ví dụ: 'ArrowLeft', 'a').
 * @param action - Hàm callback sẽ được thực thi khi phím được nhấn.
 */
export const useKeyPress = (key: string, action: () => void) => {
  useEffect(() => {
    // Hàm xử lý sự kiện
    const onKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang gõ trong một ô input hoặc textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Kiểm tra xem phím được nhấn có khớp với key mong muốn không
      if (e.key === key) {
        // Ngăn hành vi mặc định của trình duyệt (ví dụ: cuộn trang)
        e.preventDefault();
        // Thực thi hành động
        action();
      }
    };

    // Đăng ký listener
    window.addEventListener('keydown', onKeyDown);

    // Dọn dẹp: Hủy đăng ký listener khi component unmount
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [key, action]); // Chạy lại effect nếu key hoặc action thay đổi
};