import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { getOptimizedSrc } from '../../utils/imageUrl';
import { getCachedAspectRatio, setCachedAspectRatio } from '../../utils/imageDimensionCache';

interface ReaderImageProps {
  src: string;
  alt: string;
  eager?: boolean;
  onLoaded?: () => void;
}

// Ảnh trang đọc: chỉ tải khi gần viewport (±600px), giải phóng khi xa,
// giữ chỗ bằng aspect-ratio cache để trang không bị nhảy — tối ưu mobile lag.
const ReaderImage: React.FC<ReaderImageProps> = ({ src, alt, eager, onLoaded }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error' | 'unloaded'>(
    eager ? 'loading' : 'idle'
  );
  const [aspectRatio, setAspectRatio] = useState<number | null>(getCachedAspectRatio(src) ?? null);
  const [loadKey, setLoadKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedOnce = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const loadImage = useCallback(() => {
    setStatus('loading');
    const img = new Image();
    img.src = getOptimizedSrc(src);

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
      onLoadedRef.current?.();
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

  useEffect(() => {
    if (eager) {
      loadImage();
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (statusRef.current === 'idle' || statusRef.current === 'unloaded') loadImage();
          } else if (hasLoadedOnce.current && statusRef.current === 'loaded') {
            setStatus('unloaded'); // giải phóng ảnh khi ra xa viewport
          }
        });
      },
      { rootMargin: '600px 0px 600px 0px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadImage, eager]);

  const handleRetry = () => {
    setLoadKey((k) => k + 1);
    loadImage();
  };

  const showSkeleton = status === 'loading' || status === 'unloaded' || status === 'idle';

  return (
    <div
      ref={containerRef}
      className="w-full relative"
      style={{ background: 'var(--reader-bg)', aspectRatio: aspectRatio ? `1 / ${aspectRatio}` : undefined, minHeight: aspectRatio ? undefined : '50vh' }}
    >
      {status === 'loaded' && (
        <img
          key={loadKey}
          src={getOptimizedSrc(src)}
          alt={alt}
          decoding="async"
          className="w-full h-auto block select-none"
          style={{ opacity: 1, transition: 'opacity 200ms ease' }}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
      )}
      {showSkeleton && (
        <div className="absolute inset-0" style={{ background: 'var(--reader-line)', opacity: 0.35 }} />
      )}
      {status === 'error' && (
        <div className="w-full">
          <img
            src="/place-doro.webp"
            alt={alt}
            className="w-full h-auto block"
            draggable={false}
          />
          <div className="flex flex-col items-center gap-2 py-3">
            <p className="text-xs" style={{ color: 'var(--reader-muted)' }}>Không tải được ảnh này.</p>
            <button onClick={handleRetry} className="btn-ghost !text-[13px] !min-h-0 !py-1.5 !px-3">
              <FiRefreshCw size={13} /> Thử lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ReaderImage);
