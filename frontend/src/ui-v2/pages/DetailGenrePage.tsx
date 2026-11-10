import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGenreBySlugAPI } from '../../api/genreApi';
import SectionHeader from '../components/SectionHeader';
import MangaGrid from '../components/MangaGrid';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { FiArrowLeft } from 'react-icons/fi';

const DetailGenrePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [genreInfo, setGenreInfo] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    getGenreBySlugAPI(slug)
      .then(({ genre, mangas }) => {
        setGenreInfo(genre);
        setMangas(mangas || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const genreName = genreInfo?.name || slug?.charAt(0).toUpperCase() + (slug?.slice(1).replace(/-/g, ' ') || '');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <Link to="/ntr/genre" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4 transition-colors">
        <FiArrowLeft size={15} /> Tất cả thể loại
      </Link>

      <SectionHeader title={genreName} count={loading ? undefined : mangas.length} />

      {genreInfo?.description && (
        <p className="text-sm text-ink-muted leading-relaxed mb-5 max-w-2xl">{genreInfo.description}</p>
      )}

      {loading ? (
        <div className="manga-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3]" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Không tìm thấy thể loại"
          description="Thể loại này có thể đã bị xóa hoặc đường dẫn không đúng."
          actionLabel="Duyệt thể loại khác"
          actionTo="/ntr/genre"
        />
      ) : mangas.length === 0 ? (
        <EmptyState
          title="Chưa có truyện nào"
          description={`Thể loại “${genreName}” hiện chưa có truyện.`}
          actionLabel="Duyệt thể loại khác"
          actionTo="/ntr/genre"
        />
      ) : (
        <MangaGrid mangas={mangas} />
      )}
    </div>
  );
};

export default DetailGenrePage;
