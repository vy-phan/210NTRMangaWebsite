import React from 'react';
import { useImageLoader } from './useImageLoader';


interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderSrc?: string;
  containerClassName?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  placeholderSrc = '/place-doro.webp', // Placeholder mặc định
  className,
  containerClassName,
  ...props 
}) => {
  const { imageSrc, isLoading } = useImageLoader(src || '', placeholderSrc);

  return (
    // Container để giữ chỗ và hiển thị skeleton
    <div className={`relative ${containerClassName}`}>
      {/* Skeleton effect */}
      {isLoading && <div className="absolute inset-0 skeleton"></div>}

      {/* Image */}
      <img
        src={imageSrc}
        alt={alt}
        className={`
          transition-opacity duration-500
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${className}
        `}
        referrerPolicy="no-referrer"
        {...props}
      />
    </div>
  );
};

export default LazyImage;