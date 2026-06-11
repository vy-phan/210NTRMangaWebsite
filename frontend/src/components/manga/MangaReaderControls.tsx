import { useState, useEffect, useRef } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import AutoScrollControl from './AutoScrollControl';
import { clearMangaImageCache } from '../../utils/offlineDB';

interface MangaReaderControlsProps {
  isAutoScrolling: boolean;
  onTogglePlay: () => void;
  delay: number;
  onDelayChange: (newDelay: number) => void;
}

const MangaReaderControls = ({ 
  isAutoScrolling, 
  onTogglePlay, 
  delay, 
  onDelayChange 
}: MangaReaderControlsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2"
      onMouseEnter={resetTimer}
      onTouchStart={resetTimer}
      onClick={resetTimer}
    >
      {/* Nút Xóa Cache */}
      <div className={`
        pointer-events-auto transition-all duration-500 ease-in-out
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

export default MangaReaderControls;
