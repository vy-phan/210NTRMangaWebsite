import { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiSettings, FiMinus, FiPlus, FiX } from 'react-icons/fi';

interface AutoScrollControlProps {
  isAutoScrolling: boolean;
  onTogglePlay: () => void;
  delay: number;
  onDelayChange: (newDelay: number) => void;
}

const AutoScrollControl = ({ isAutoScrolling, onTogglePlay, delay, onDelayChange }: AutoScrollControlProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isVisible, setIsVisible] = useState(true); // Trạng thái ẩn/hiện
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOGIC TỰ ĐỘNG ẨN ---
  const resetTimer = () => {
    setIsVisible(true); // Hiện ngay lập tức khi có tương tác
    
    // Xóa timer cũ
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Nếu đang mở bảng cài đặt thì KHÔNG đếm ngược để ẩn
    if (showSettings) return;

    // Set timer mới: Sau 3 giây không chạm gì sẽ tự ẩn
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  // Mỗi khi showSettings thay đổi hoặc delay thay đổi (người dùng đang chỉnh), reset timer
  useEffect(() => {
    resetTimer();
  }, [showSettings, delay, isAutoScrolling]);

  // Hàm tăng giảm thời gian
  const adjustDelay = (amount: number) => {
    const newVal = Math.max(2, Math.min(60, delay + amount));
    onDelayChange(newVal);
    resetTimer(); // Reset timer khi bấm nút
  };

  return (
    // Wrapper "Vùng cảm ứng" (Hot Zone)
    // padding-40px: Mở rộng vùng cảm ứng ra xung quanh để dễ chạm/hover hơn
    <div 
      className="fixed bottom-0 right-0 z-50 p-6 flex flex-col items-end gap-3 touch-none"
      onMouseEnter={resetTimer} // Desktop: Hover vào vùng này là hiện
      onTouchStart={resetTimer} // Mobile: Chạm vào vùng này là hiện
      onClick={resetTimer}      // Click bất kỳ đâu trong này cũng hiện
    >
      
      {/* --- BẢNG CÀI ĐẶT --- */}
      <div 
        className={`
          pointer-events-auto origin-bottom-right
          bg-base-100/95 backdrop-blur-md border border-base-300 shadow-2xl rounded-2xl p-4 w-72 mb-2
          transition-all duration-300 ease-out
          ${showSettings 
             ? 'scale-100 opacity-100 translate-y-0' 
             : 'scale-90 opacity-0 translate-y-8 pointer-events-none absolute'}
        `}
      >
        <div className="flex justify-between items-center mb-4 border-b border-base-200 pb-2">
          <span className="font-bold text-base-content flex items-center gap-2">
            ⏱ Tốc độ cuộn
          </span>
          <button onClick={() => setShowSettings(false)} className="btn btn-ghost btn-xs btn-circle">
            <FiX />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-center items-end gap-1 text-primary">
            <span className="text-4xl font-black">{delay}</span>
            <span className="text-sm font-semibold mb-1 text-base-content/60">giây / trang</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn btn-circle btn-sm btn-outline" onClick={() => adjustDelay(-1)}><FiMinus /></button>
            <input 
              type="range" min="2" max="30" step="1"
              value={delay} 
              onChange={(e) => { onDelayChange(Number(e.target.value)); resetTimer(); }}
              className="range range-primary range-sm flex-1" 
            />
            <button className="btn btn-circle btn-sm btn-outline" onClick={() => adjustDelay(1)}><FiPlus /></button>
          </div>
        </div>
      </div>

      {/* --- CỤM NÚT ĐIỀU KHIỂN CHÍNH --- */}
      {/* Áp dụng hiệu ứng mờ dần (opacity) và trượt xuống (translate-y) khi ẩn */}
      <div className={`
          flex items-center gap-3 pointer-events-auto transition-all duration-500 ease-in-out
          ${isVisible || showSettings ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-10 scale-90 blur-[1px]'}
      `}>
        
        {/* Nút Settings */}
        <button
          className={`btn btn-circle shadow-lg transition-all ${showSettings ? 'btn-neutral' : 'btn-base-100'}`}
          onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
        >
          <FiSettings size={20} className={showSettings ? 'animate-spin-slow' : ''} />
        </button>

        {/* Nút Play/Pause */}
        <button
          className={`btn btn-circle btn-lg shadow-xl border-4 transition-all transform active:scale-95 ${
            isAutoScrolling 
              ? 'btn-error border-error/30 animate-pulse' 
              : 'btn-primary border-primary/30'
          }`}
          onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
        >
          {isAutoScrolling ? <FiPause size={32} fill="currentColor" /> : <FiPlay size={32} fill="currentColor" className="ml-1" />}
        </button>
      </div>

    </div>
  );
};

export default AutoScrollControl;