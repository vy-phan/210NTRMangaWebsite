import React, { useState } from 'react';
import { useUiStore, type ThemePref } from '../lib/uiStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useFollowStore } from '../lib/followStore';
import { useProgressStore } from '../lib/progressStore';
import { toast } from 'react-hot-toast';
import { FiSun, FiMoon, FiMonitor, FiTrash2 } from 'react-icons/fi';
import SectionHeader from '../components/SectionHeader';

const THEME_OPTIONS: { key: ThemePref; label: string; icon: React.ReactNode }[] = [
  { key: 'light', label: 'Sáng', icon: <FiSun size={16} /> },
  { key: 'dark', label: 'Tối', icon: <FiMoon size={16} /> },
  { key: 'system', label: 'Theo hệ thống', icon: <FiMonitor size={16} /> },
];

const SettingsPage: React.FC = () => {
  const ui = useUiStore();
  const [confirmClear, setConfirmClear] = useState(false);

  const clearLocalData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    useHistoryStore.getState().clearHistory();
    useFollowStore.getState().clearFollows();
    useProgressStore.getState().clearAll();
    toast.success('Đã xóa dữ liệu trên máy');
    setConfirmClear(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 space-y-8">
      <SectionHeader title="Cài đặt" />

      {/* Giao diện */}
      <section className="surface p-4 md:p-5">
        <h3 className="font-display font-bold text-ink mb-3">Giao diện</h3>
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => ui.setTheme(o.key)}
              className={`chip ${ui.theme === o.key ? 'chip-active' : ''}`}
            >
              {o.icon} {o.label}
            </button>
          ))}
        </div>
      </section>

      {/* Mặc định trình đọc */}
      <section className="surface p-4 md:p-5 space-y-5">
        <h3 className="font-display font-bold text-ink">Mặc định trình đọc</h3>
        <p className="text-xs text-ink-muted -mt-3">Trình đọc luôn dùng chế độ cuộn dọc, nền tối.</p>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium text-ink">Độ rộng tối đa</p>
            <span className="text-xs text-ink-muted">{ui.readerWidth}px</span>
          </div>
          <input
            type="range"
            min={480}
            max={1200}
            step={20}
            value={ui.readerWidth}
            onChange={(e) => ui.setReaderWidth(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-medium text-ink">Khoảng cách giữa các trang</p>
            <span className="text-xs text-ink-muted">{ui.readerGap}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={4}
            value={ui.readerGap}
            onChange={(e) => ui.setReaderGap(Number(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
      </section>

      {/* Dữ liệu trên máy */}
      <section className="surface p-4 md:p-5">
        <h3 className="font-display font-bold text-ink mb-1">Dữ liệu trên máy</h3>
        <p className="text-xs text-ink-muted mb-3">Xóa lịch sử đọc, thư viện và tiến độ đọc đã lưu.</p>
        <button
          onClick={clearLocalData}
          className="btn-ghost text-danger"
          style={confirmClear ? { borderColor: 'var(--danger)', background: 'var(--danger-soft)' } : undefined}
        >
          <FiTrash2 size={15} />
          {confirmClear ? 'Bấm lần nữa để xác nhận xóa' : 'Xóa dữ liệu trên máy'}
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
