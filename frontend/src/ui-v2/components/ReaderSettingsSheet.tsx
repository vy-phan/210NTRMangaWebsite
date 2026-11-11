import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useUiStore } from '../lib/uiStore';

// Ngăn kéo cài đặt trình đọc (chỉ cuộn dọc)
const ReaderSettingsSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const readerWidth = useUiStore((s) => s.readerWidth);
  const setReaderWidth = useUiStore((s) => s.setReaderWidth);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-8 space-y-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Cài đặt trình đọc"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-ink">Cài đặt đọc</h3>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink" aria-label="Đóng">
            <FiX size={18} />
          </button>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-ink">Độ rộng tối đa</span>
            <span className="text-ink-muted">{readerWidth}px</span>
          </div>
          <input
            type="range"
            min={480}
            max={1200}
            step={20}
            value={readerWidth}
            onChange={(e) => setReaderWidth(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <p className="text-[11px] text-ink-muted">
          Cuộn dọc là chế độ đọc mặc định, ảnh hiển thị liền mạch. Chạm vào ảnh để ẩn/hiện thanh công cụ.
        </p>
      </div>
    </div>
  );
};

export default ReaderSettingsSheet;
