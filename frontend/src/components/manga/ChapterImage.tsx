import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

interface ChapterImageProps {
  src: string;
  alt: string;
}

const ChapterImage: React.FC<ChapterImageProps> = ({ src, alt }) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState('/place-doro.webp');
  const [loadKey, setLoadKey] = useState(0); // Key để reset component khi retry
  const imgRef = useRef<HTMLDivElement>(null);

  const preventInteraction = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };

  // Hàm load ảnh
  const loadImage = useCallback(() => {
    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Intersection Observer để phát hiện khi ảnh vào viewport
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '1000px 0px', // Load ảnh trước 1000px (tốt hơn cho iPhone)
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, []);

  // Tải ảnh thật khi vào viewport
  useEffect(() => {
    if (!isInView) return;
    return loadImage();
  }, [isInView, loadKey, loadImage]);

  // Hàm retry load ảnh
  const handleRetry = () => {
    setLoadKey(prev => prev + 1);
  };

  return (
    <div ref={imgRef} className={`w-full relative ${isLoading || hasError ? 'min-h-[50vh] bg-base-300' : ''}`}>
      <img
        key={loadKey}
        src={imageSrc}
        alt={alt}
        className={`
          max-w-full h-auto block mx-auto
          transition-opacity duration-500
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        referrerPolicy="no-referrer"
        onContextMenu={preventInteraction}
        onDragStart={preventInteraction}
      />
      
      {/* Hiển thị skeleton khi đang load */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300">
          <div className="skeleton h-full w-full"></div>
        </div>
      )}

      {/* Hiển thị nút retry khi lỗi */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300 gap-4">
          <p className="text-center text-base-content/70">Không thể tải ảnh</p>
          <button 
            onClick={handleRetry}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <FiRefreshCw />
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ChapterImage);