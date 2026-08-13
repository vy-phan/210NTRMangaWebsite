import React, { useState, useEffect, useRef } from 'react';
import { FiTrash2, FiArrowUp, FiChevronRight, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import AutoScrollControl from './AutoScrollControl';
import { clearMangaImageCache } from '../../utils/offlineDB';

interface MangaReaderControlsProps {
  isAutoScrolling: boolean;
  onTogglePlay: () => void;
  delay: number;
  onDelayChange: (newDelay: number) => void;
}

const COLLAPSE_STORAGE_KEY = 'mangaReaderControls:collapsed';

const MangaReaderControls = ({
  isAutoScrolling,
  onTogglePlay,
  delay,
  onDelayChange
}: MangaReaderControlsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // === STATE THU GỌN, LƯU VÀO LOCALSTORAGE ===
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(COLLAPSE_STORAGE_KEY, String(isCollapsed));
    // Khi thu gọn thì tắt luôn settings đang mở (nếu có) cho gọn
    if (isCollapsed) setShowSettings(false);
  }, [isCollapsed]);

  const resetTimer = () => {
    setIsVisible(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (showSettings) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  useEffect(() => {
    resetTimer();
  }, [showSettings, delay, isAutoScrolling]);

  const handleClearCache = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa cache ảnh truyện?')) {
      setIsClearing(true);
      try {
        const success = await clearMangaImageCache();
        if (success) {
          toast.success('Đã xóa cache ảnh truyện thành công!');
        } else {
          toast.error('Có lỗi khi xóa cache!');
        }
      } catch (error) {
        console.error(error);
        toast.error('Có lỗi khi xóa cache!');
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // === NÚT TOGGLE THU GỌN - LUÔN HIỂN THỊ ===
  if (isCollapsed) {
    return (
      <button
        className="fixed bottom-6 left-0 z-50 btn btn-circle rounded-l-none shadow-lg bg-base-200 hover:bg-base-300 text-base-content"
        onClick={() => setIsCollapsed(false)}
        title="Mở bảng điều khiển"
      >
        <FiChevronRight size={20} />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2"
      onMouseEnter={resetTimer}
      onTouchStart={resetTimer}
      onClick={resetTimer}
    >
      {/* Nút Thu gọn */}
      <button
        className={`
    btn btn-circle shadow-lg bg-red-500 hover:bg-red-600 text-white
    transition-all duration-500 ease-in-out
    ${isVisible || showSettings ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-10 scale-90 blur-[1px]'}
  `}
        onClick={(e) => {
          e.stopPropagation();
          setIsCollapsed(true);
        }}
        title="Thu gọn bảng điều khiển"
      >
        <FiX size={20} />
      </button>

      {/* Nút Xóa Cache và Scroll lên đầu */}
      <div className={`
        pointer-events-auto transition-all duration-500 ease-in-out flex gap-2
          ${isVisible || showSettings ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-10 scale-90 blur-[1px]'}
      `}>
        <button
          className="btn btn-circle shadow-lg bg-red-500 hover:bg-red-600 text-white"
          onClick={handleClearCache}
          disabled={isClearing}
        >
          {isClearing ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <FiTrash2 size={20} />
          )}
        </button>
        <button
          className="btn btn-circle shadow-lg bg-secondary hover:bg-secondary-focus text-white"
          onClick={handleScrollToTop}
          title="Lên đầu trang"
        >
          <FiArrowUp size={20} />
        </button>
      </div>
      <AutoScrollControl
        isAutoScrolling={isAutoScrolling}
        onTogglePlay={onTogglePlay}
        delay={delay}
        onDelayChange={onDelayChange}
        isVisible={isVisible}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        resetTimer={resetTimer}
      />
    </div>
  );
};

export default React.memo(MangaReaderControls);