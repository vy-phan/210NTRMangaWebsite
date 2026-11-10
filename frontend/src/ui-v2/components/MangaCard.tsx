import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from './Skeleton';
import FallbackImg from './FallbackImg';

interface MangaCardProps {
  manga: Manga;
  /** 0..1 — hiện thanh tiến độ đọc ở đáy bìa */
  progress?: number;
}

const statusShort = (status?: string): { label: string; cls: string } | null => {
  if (status === 'Ongoing') return { label: 'Đang ra', cls: 'bg-rind-soft text-rind' };
  if (status === 'Completed') return { label: 'Hoàn thành', cls: 'bg-surface text-ink-muted border-line' };
  return null;
};

const MangaCard: React.FC<MangaCardProps> = ({ manga, progress }) => {
  const [loaded, setLoaded] = useState(false);
  const latestCh = manga.latestChapters?.[0];
  const badge = statusShort(manga.status);

  return (
    <Link to={`/ntr/manga/${manga.slug}`} className="manga-card">
      <div className="cover">
        {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
        <FallbackImg
          src={manga.poster}
          alt={manga.title}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 200ms ease' }}
        />
        {badge && (
          <span
            className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.cls}`}
            style={{ background: 'var(--surface)' }}
          >
            {badge.label}
          </span>
        )}
        {latestCh && (
          <span
            className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
            style={{ background: 'rgba(11,12,16,0.72)', backdropFilter: 'blur(4px)' }}
          >
            Ch.{latestCh.number}
          </span>
        )}
        {typeof progress === 'number' && progress > 0 && (
          <span className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'var(--line)' }}>
            <span className="block h-full" style={{ width: `${Math.min(100, progress * 100)}%`, background: 'var(--accent)' }} />
          </span>
        )}
      </div>
      <h3 className="text-[13px] font-medium leading-snug line-clamp-2 text-ink">{manga.title}</h3>
    </Link>
  );
};

export default MangaCard;
