import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useProgressStore } from '../lib/progressStore';
import { chapterLabel } from '../lib/format';

// Ngăn kéo danh sách chương trong trình đọc
const ChapterSheet: React.FC<{
  slug: string;
  chapters: Chapter[];
  currentNumber: number; // số hiển thị 1-based
  mangaId: string;
  onClose: () => void;
}> = ({ slug, chapters, currentNumber, mangaId, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  // subscribe để mờ chương đã đọc
  const progressData = useProgressStore((s) => s.data);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sorted = useMemo(() => {
    void progressData;
    let list = [...chapters].sort((a, b) => b.number - a.number); // mới trước
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) => String(c.number + 1).includes(q) || (c.title || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [chapters, query, progressData]);

  const isRead = (n: number) => !!mangaId && useProgressStore.getState().isRead(mangaId, n);

  // Mở sheet → cuộn để chương đang đọc nằm giữa danh sách
  useEffect(() => {
    const container = listRef.current;
    const el = container?.querySelector<HTMLElement>('[data-current="true"]');
    if (!container || !el) return;
    const top = el.offsetTop - (container.clientHeight - el.offsetHeight) / 2;
    container.scrollTo({ top: Math.max(0, top) });
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[75dvh]"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Danh sách chương"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <p className="font-display font-bold text-ink">Chương truyện <span className="text-sm font-normal text-ink-muted">({chapters.length})</span></p>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink" aria-label="Đóng">
            <FiX size={18} />
          </button>
        </div>

        <div className="px-4 py-2.5 border-b border-line">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lọc theo số hoặc tên chương…"
            className="input !py-2 !min-h-0 !text-base"
          />
        </div>

        <div ref={listRef} className="relative overflow-y-auto p-2 pb-6">
          {sorted.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-8">Không có chương khớp bộ lọc.</p>
          ) : (
            sorted.map((ch) => {
              const displayNum = ch.number + 1;
              const current = displayNum === currentNumber;
              const read = isRead(displayNum);
              return (
                <button
                  key={ch._id}
                  data-current={current || undefined}
                  onClick={() => {
                    onClose();
                    navigate(`/ntr/manga/${slug}/chapter/${displayNum}`);
                  }}
                  className={`w-full flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl text-left transition-colors ${
                    current ? 'bg-accent-soft' : 'hover:bg-surface-2'
                  } ${read && !current ? 'opacity-55' : ''}`}
                >
                  <span
                    className="w-9 shrink-0 text-center text-[13px] font-semibold rounded-md py-1"
                    style={{
                      background: current ? 'var(--accent)' : 'var(--surface-2)',
                      color: current ? '#fff' : 'var(--ink-muted)',
                    }}
                  >
                    {displayNum}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm truncate ${current ? 'text-accent font-semibold' : 'text-ink font-medium'}`}>
                      {chapterLabel(displayNum, ch.title)}
                    </span>
                    {ch.createdAt && (
                      <span className="block text-[11px] text-ink-muted">
                        {new Date(ch.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </span>
                  {current && <span className="text-[11px] font-bold text-accent shrink-0">Đang đọc</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterSheet;
