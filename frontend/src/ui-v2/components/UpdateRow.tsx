import React from 'react';
import { Link } from 'react-router-dom';
import { relativeTime, chapterLabel } from '../lib/format';
import FallbackImg from './FallbackImg';

interface UpdateRowProps {
  manga: Manga;
}

// Dòng "Mới cập nhật": bìa nhỏ + tên + tối đa 3 chương mới nhất
const UpdateRow: React.FC<UpdateRowProps> = ({ manga }) => {
  const chapters = (manga.latestChapters || []).slice(0, 3);

  return (
    <div className="flex gap-3 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
      <Link to={`/ntr/manga/${manga.slug}`} className="shrink-0">
        <div className="cover" style={{ width: 64, height: 96 }}>
          <FallbackImg src={manga.poster} alt={manga.title} />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/ntr/manga/${manga.slug}`}>
          <h3 className="text-sm font-semibold text-ink line-clamp-1 hover:text-accent transition-colors">
            {manga.title}
          </h3>
        </Link>
        <div className="mt-1 space-y-0.5">
          {chapters.length === 0 && (
            <span className="text-xs text-ink-muted">Chưa có chương</span>
          )}
          {chapters.map((ch) => (
            <div key={ch._id} className="flex items-center justify-between gap-2">
              <Link
                to={`/ntr/manga/${manga.slug}/chapter/${ch.number}`}
                className="text-[13px] text-ink-muted hover:text-accent transition-colors truncate min-w-0"
              >
                {chapterLabel(ch.number, ch.title)}
              </Link>
              {ch.createdAt && (
                <span className="text-[11px] text-ink-muted shrink-0">{relativeTime(ch.createdAt)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateRow;
