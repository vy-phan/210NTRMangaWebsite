import React from 'react';
import { Link } from 'react-router-dom';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useProgressStore, getSavedPos } from '../lib/progressStore';
import { relativeTime, chapterLabel } from '../lib/format';
import SectionHeader from './SectionHeader';
import FallbackImg from './FallbackImg';

// Dải "Đọc tiếp" — chỉ hiện khi có lịch sử
const ContinueStrip: React.FC = () => {
  const history = useHistoryStore((s) => s.history);
  // subscribe để cập nhật khi progress đổi
  useProgressStore((s) => s.data);

  if (history.length === 0) return null;
  const items = history.slice(0, 14);

  return (
    <section>
      <SectionHeader title="Đọc tiếp" />
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 pb-1">
        {items.map((item) => {
          const pos = getSavedPos(item.mangaId, item.chapterNumber);
          const progress = pos && pos.total > 0 ? (pos.page + 1) / pos.total : undefined;
          const pageLabel = pos ? `trang ${Math.min(pos.page + 1, pos.total)}/${pos.total}` : '';
          return (
            <Link
              key={item.mangaId}
              to={`/ntr/manga/${item.mangaSlug}/chapter/${item.chapterNumber}`}
              className="manga-card shrink-0"
              style={{ width: 108 }}
            >
              <div className="cover">
                <FallbackImg src={item.mangaPoster} alt={item.mangaTitle} />
                {progress !== undefined && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'var(--line)' }}>
                    <span className="block h-full" style={{ width: `${Math.min(100, progress * 100)}%`, background: 'var(--accent)' }} />
                  </span>
                )}
              </div>
              <h3 className="text-xs font-medium leading-snug line-clamp-1 text-ink">{item.mangaTitle}</h3>
              <p className="text-[11px] text-ink-muted truncate">
                {chapterLabel(item.chapterNumber, item.chapterTitle)}
                {pageLabel ? ` · ${pageLabel}` : ''}
                {' · '}
                {relativeTime(item.readAt)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueStrip;
