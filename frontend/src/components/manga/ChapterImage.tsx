import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { getOptimizedSrc } from '../../utils/imageUrl';
import { getCachedAspectRatio, setCachedAspectRatio } from '../../utils/imageDimensionCache';

interface ChapterImageProps {
  src: string;
  alt: string;
}

const ChapterImage: React.FC<ChapterImageProps> = ({ src, alt }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error' | 'unloaded'>('idle');
  const [aspectRatio, setAspectRatio] = useState<number | null>(getCachedAspectRatio(src) ?? null);
  const [loadKey, setLoadKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedOnce = useRef(false);

  // Giữ status mới nhất trong ref để observer không cần tạo lại mỗi lần status đổi
  const statusRef = useRef(status);
  statusRef.current = status;

  const preventInteraction = (e: React.MouseEvent | React.DragEvent) => e.preventDefault();

  const loadImage = useCallback(() => {
    setStatus('loading');
    const img = new Image();
    img.src = getOptimizedSrc(src);

    // An toàn: nếu mạng chập chờn, ảnh treo mãi ở "loading" -> tự chuyển sang lỗi sau 15s
    const timeoutId = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'error' : s));
    }, 15000);

    img.onload = () => {
      clearTimeout(timeoutId);
      if (img.naturalWidth > 0) {
        const ratio = img.naturalHeight / img.naturalWidth;
        setCachedAspectRatio(src, ratio);
        setAspectRatio(ratio);
      }
      hasLoadedOnce.current = true;
      setStatus('loaded');
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      setStatus('error');
    };

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Observer: chỉ tạo 1 lần khi mount, không tạo lại mỗi khi status đổi
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (statusRef.current === 'idle' || statusRef.current === 'unloaded') loadImage();
          } else if (hasLoadedOnce.current && statusRef.current === 'loaded') {
            setStatus('unloaded');
          }
        });
      },
      {
        rootMargin: '600px 0px 600px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [loadImage]);

  // Lưới an toàn: ép kiểm tra thủ công khi DetailChapter bắn sự kiện force-check-images
  useEffect(() => {
    const forceCheck = () => {
      if (!containerRef.current) return;
      if (statusRef.current !== 'idle' && statusRef.current !== 'unloaded') return;
      const rect = containerRef.current.getBoundingClientRect();
      const margin = window.innerHeight * 1.5;
      if (rect.bottom > -margin && rect.top < window.innerHeight + margin) {
        loadImage();
      }
    };
    window.addEventListener('force-check-images', forceCheck);
    return () => window.removeEventListener('force-check-images', forceCheck);
  }, [loadImage]);

  const handleRetry = () => {
    setLoadKey((k) => k + 1);
    loadImage();
  };

  const showSkeleton = status === 'loading' || status === 'unloaded' || status === 'idle';

  return (
    <div
      ref={containerRef}
      className="w-full relative bg-base-300"
      style={aspectRatio ? { aspectRatio: `1 / ${aspectRatio}` } : { minHeight: '60vh' }}
    >
      {status === 'loaded' && (
        <img
          key={loadKey}
          src={getOptimizedSrc(src)}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="max-w-full h-auto block mx-auto opacity-100 transition-opacity duration-300"
          referrerPolicy="no-referrer"
          onContextMenu={preventInteraction}
          onDragStart={preventInteraction}
        />
      )}

      {showSkeleton && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-300">
          <div className="skeleton h-full w-full" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-300 gap-4">
          <p className="text-center text-base-content/70">Không thể tải ảnh</p>
          <button onClick={handleRetry} className="btn btn-primary btn-sm flex items-center gap-2">
            <FiRefreshCw />
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ChapterImage);