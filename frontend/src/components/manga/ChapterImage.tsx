import React, { useState, useRef, useEffect } from 'react';

interface ChapterImageProps {
  src: string;
  alt: string;
}

const ChapterImage: React.FC<ChapterImageProps> = ({ src, alt }) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState('/place-doro.webp');
  const imgRef = useRef<HTMLDivElement>(null);

  const preventInteraction = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };

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
        rootMargin: '500px 0px', // Load ảnh trước 500px khi vào viewport
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

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src]);

  return (
    <div ref={imgRef} className={`w-full relative ${isLoading ? 'min-h-screen bg-base-300' : ''}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`
          max-w-full h-auto block mx-auto
          transition-opacity duration-500
          ${isLoading ? 'opacity-0' : 'opacity-100'}
        `}
        loading="lazy"
        referrerPolicy="no-referrer"
        onContextMenu={preventInteraction}
        onDragStart={preventInteraction}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300">
          <div className="skeleton h-full w-full"></div>
        </div>
      )}
    </div>
  );
};

export default ChapterImage;