import React from 'react';
import { Link } from 'react-router-dom';
import { useFollowStore } from '../lib/followStore';
import { FiBookmark, FiX } from 'react-icons/fi';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import FallbackImg from '../components/FallbackImg';

// Thư viện = danh sách truyện đã lưu để đọc, lưu trên máy (không phân loại)
const LibraryPage: React.FC = () => {
  const follows = useFollowStore((s) => s.follows);
  const removeFollow = useFollowStore((s) => s.removeFollow);

  const list = Object.values(follows).sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <SectionHeader title="Thư viện" count={list.length} />

      {list.length === 0 ? (
        <EmptyState
          icon={<FiBookmark size={26} />}
          title="Chưa lưu truyện nào"
          description="Bấm Lưu ở trang truyện để thêm vào thư viện đọc sau."
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
                </div>
                <h3 className="text-xs font-medium leading-snug line-clamp-2 text-ink mt-1.5">{f.title}</h3>
              </Link>
              <button
                onClick={() => removeFollow(f.mangaId)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                style={{ background: 'rgba(11,12,16,0.72)', color: '#fff' }}
                aria-label={`Xóa ${f.title} khỏi thư viện`}
                title="Xóa khỏi thư viện"
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
