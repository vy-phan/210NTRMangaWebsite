import { FiPlay, FiPause, FiSettings, FiMinus, FiPlus, FiX } from 'react-icons/fi';

interface AutoScrollControlProps {
  isAutoScrolling: boolean;
  onTogglePlay: () => void;
  delay: number;
  onDelayChange: (newDelay: number) => void;
  isVisible: boolean;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  resetTimer: () => void;
}

const AutoScrollControl = ({ 
  isAutoScrolling, 
  onTogglePlay, 
  delay, 
  onDelayChange, 
  isVisible, 
  showSettings, 
  setShowSettings, 
  resetTimer 
}: AutoScrollControlProps) => {
  const adjustDelay = (amount: number) => {
    const newVal = Math.max(2, Math.min(60, delay + amount));
    onDelayChange(newVal);
    resetTimer();
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div 
        className={`
          pointer-events-auto origin-bottom-left
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

      <div className={`
          flex items-center gap-3 pointer-events-auto transition-all duration-500 ease-in-out
          ${isVisible || showSettings ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-10 scale-90 blur-[1px]'}
      `}>
        <button
          className={`btn btn-circle shadow-lg transition-all ${showSettings ? 'btn-neutral' : 'btn-base-100'}`}
          onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
        >
          <FiSettings size={20} className={showSettings ? 'animate-spin-slow' : ''} />
        </button>

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