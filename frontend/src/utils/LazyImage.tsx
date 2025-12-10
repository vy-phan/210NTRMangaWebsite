// LazyImage.tsx
import React, { useState, useEffect } from 'react';
import { useImageLoader } from './useImageLoader';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderSrc?: string;
  containerClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  placeholderSrc = '/place-doro.webp',
  className,
  containerClassName,
  ...props 
}) => {
  const { imageSrc, isLoading } = useImageLoader(src || '', placeholderSrc);
  const [isContentHidden, setIsContentHidden] = useState(() => localStorage.getItem('isContentHidden') === 'true');

  useEffect(() => {
    const checkHiddenState = () => {
      setIsContentHidden(localStorage.getItem('isContentHidden') === 'true');
    };
    window.addEventListener('storage-local-change', checkHiddenState);
    return () => {
      window.removeEventListener('storage-local-change', checkHiddenState);
    };
  }, []);

  return (
    // THÊM: `overflow-hidden` vào thẻ cha để cắt phần ảnh bị phóng to tràn ra ngoài
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {isLoading && <div className="absolute inset-0 skeleton"></div>}

      <img
        src={imageSrc}
        alt={alt}
        className={`
          transition-all duration-500
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${isContentHidden ? 'blur-md scale-105' : 'blur-0 scale-100'}
          
          ${className}
        `}
        referrerPolicy="no-referrer"
        {...props}
      />
    </div>
  );
};

export default LazyImage;