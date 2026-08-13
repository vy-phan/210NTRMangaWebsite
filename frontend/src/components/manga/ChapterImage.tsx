import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { getOptimizedSrc } from '../../utils/imageUrl';

// Cache kích thước ảnh đã biết, tránh đo lại mỗi lần scroll qua lại
const dimensionCache = new Map<string, number>(); // src -> aspectRatio (h/w)

interface ChapterImageProps {
  src: string;
  alt: string;
}

const ChapterImage: React.FC<ChapterImageProps> = ({ src, alt }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error' | 'unloaded'>('idle');
  const [aspectRatio, setAspectRatio] = useState<number | null>(dimensionCache.get(src) ?? null);
  const [loadKey, setLoadKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedOnce = useRef(false);

  const preventInteraction = (e: React.MouseEvent | React.DragEvent) => e.preventDefault();

  const loadImage = useCallback(() => {
    setStatus('loading');
    const img = new Image();
    img.src = getOptimizedSrc(src);

    img.onload = () => {
      if (img.naturalWidth > 0) {
        const ratio = img.naturalHeight / img.naturalWidth;
        dimensionCache.set(src, ratio);
        setAspectRatio(ratio);
      }
      hasLoadedOnce.current = true;
      setStatus('loaded');
    };

    img.onerror = () => setStatus('error');

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // Observer: load khi gần viewport (biên hẹp hơn để tiết kiệm RAM), unload khi đi xa
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (status === 'idle' || status === 'unloaded') loadImage();
          } else if (hasLoadedOnce.current && status === 'loaded') {
            // Đi xa khỏi viewport -> nhả ảnh khỏi bộ nhớ, giữ chỗ bằng aspect-ratio
            setStatus('unloaded');
          }
        });
      },
      {
        // Giảm từ 1000px xuống, và tách preload trước/sau
        rootMargin: '600px 0px 600px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [status, loadImage]);

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