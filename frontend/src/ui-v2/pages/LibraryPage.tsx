import React from 'react';
import { Link } from 'react-router-dom';
import { useFollowStore, FOLLOW_STATUS_LABEL, type FollowStatus } from '../lib/followStore';
import { FiBookmark, FiX } from 'react-icons/fi';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import FallbackImg from '../components/FallbackImg';

const FILTERS: { key: FollowStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'reading', label: 'Đang đọc' },
  { key: 'plan', label: 'Sẽ đọc' },
  { key: 'done', label: 'Đã đọc xong' },
  { key: 'dropped', label: 'Bỏ dở' },
];

// Thư viện = danh sách theo dõi, lưu trên máy
const LibraryPage: React.FC = () => {
  const follows = useFollowStore((s) => s.follows);
  const removeFollow = useFollowStore((s) => s.removeFollow);
  const [filter, setFilter] = React.useState<FollowStatus | 'all'>('all');

  const list = Object.values(follows)
    .filter((f) => filter === 'all' || f.status === filter)
    .sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <SectionHeader title="Thư viện" count={Object.keys(follows).length} />

      {Object.keys(follows).length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`chip ${filter === f.key ? 'chip-active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          icon={<FiBookmark size={26} />}
          title={Object.keys(follows).length === 0 ? 'Chưa theo dõi truyện nào' : 'Không có truyện trong mục này'}
          description={
            Object.keys(follows).length === 0
              ? 'Bấm Theo dõi ở trang truyện để lưu vào đây.'
              : 'Đổi bộ lọc hoặc theo dõi thêm truyện mới.'
          }
          actionLabel="Tìm truyện"
          actionTo="/ntr/search"
        />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {list.map((f) => (
            <div key={f.mangaId} className="manga-card group relative">
              <Link to={`/ntr/manga/${f.slug}`} className="block">
                <div className="cover">
                  <FallbackImg src={f.poster} alt={f.title} />
                  <span
                    className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background: 'rgba(11,12,16,0.72)', color: 'var(--rind)', backdropFilter: 'blur(4px)' }}
                  >
                    {FOLLOW_STATUS_LABEL[f.status]}
                  </span>
                </div>
                <h3 className="text-xs font-medium leading-snug line-clamp-2 text-ink mt-1.5">{f.title}</h3>
              </Link>
              <button
                onClick={() => removeFollow(f.mangaId)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                style={{ background: 'rgba(11,12,16,0.72)', color: '#fff' }}
                aria-label={`Bỏ theo dõi ${f.title}`}
                title="Bỏ theo dõi"
              >
                <FiX size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
