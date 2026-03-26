import { useState, useEffect } from 'react';

/**
 * Một custom hook để quản lý trạng thái tải của một hình ảnh.
 * Nó sẽ trả về trạng thái loading và URL của ảnh placeholder.
 * 
 * @param src - URL của hình ảnh thật cần tải.
 * @param placeholderSrc - URL của hình ảnh placeholder.
 * @returns Một object chứa { imageSrc, isLoading }.
 */
export const useImageLoader = (src: string, placeholderSrc: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(placeholderSrc);

  useEffect(() => {
    // 1. Tạo một đối tượng Image mới trong bộ nhớ
    const img = new Image();

    // 2. Gán URL của ảnh thật vào đối tượng Image
    img.src = src;

    // 3. Lắng nghe sự kiện `onload`
    // Sự kiện này sẽ được kích hoạt khi ảnh thật đã được tải xong
    img.onload = () => {
      // Cập nhật state để hiển thị ảnh thật và tắt loading
      setImageSrc(src);
      setIsLoading(false);
    };

    // (Tùy chọn) Xử lý lỗi nếu ảnh thật không tải được
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      // Giữ lại ảnh placeholder và tắt loading
      setIsLoading(false);
    };

    // Cleanup function (quan trọng nếu src thay đổi)
    return () => {
      img.onload = null;
      img.onerror = null;
    };

  }, [src, placeholderSrc]); // Chạy lại effect nếu URL ảnh thật hoặc placeholder thay đổi

  return { imageSrc, isLoading };
};