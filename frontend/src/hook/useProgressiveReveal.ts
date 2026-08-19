import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hiển thị dần dữ liệu đã có sẵn trong bộ nhớ (không phân trang backend).
 * Ban đầu chỉ render `initialCount` phần tử, mỗi lần sentinel vào viewport
 * sẽ tăng thêm `step` phần tử, tới khi hết danh sách.
 */
export function useProgressiveReveal<T>(items: T[], initialCount = 9, step = 9) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset về ban đầu khi danh sách gốc đổi (VD: đổi bộ lọc, load lại trang)
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [items, initialCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + step, items.length));
  }, [items.length, step]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    if (visibleCount >= items.length) return; // đã hiện hết, không cần theo dõi nữa

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '400px 0px' } // load trước khi chạm đáy ~400px
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, items.length, loadMore]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return { visibleItems, hasMore, sentinelRef };
}