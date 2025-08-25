import React from 'react';
import { useImageLoader } from '../../utils/useImageLoader';


interface ChapterImageProps {
  src: string;
  alt: string;
}

const ChapterImage: React.FC<ChapterImageProps> = ({ src, alt }) => {
  const { imageSrc, isLoading } = useImageLoader(src, './place-doro.webp');

  return (
    // Container để giữ tỷ lệ khung hình trong khi ảnh thật đang tải
    // `min-h-screen` giả định một ảnh truyện thường cao
    <div className={`w-full ${isLoading ? 'min-h-screen bg-base-300 animate-pulse' : ''}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`
          max-w-full h-auto block mx-auto
          transition-opacity duration-500
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default ChapterImage;