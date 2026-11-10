import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMangaByCategoryAPI } from '../../api/mangaApi';
import SectionHeader from '../components/SectionHeader';
import MangaGrid from '../components/MangaGrid';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { FiArrowLeft } from 'react-icons/fi';

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryName) return;
    setLoading(true);
    getMangaByCategoryAPI(categoryName)
      .then(setMangas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryName]);

  const labels: Record<string, string> = { Manga: 'Manga', Manhwa: 'Manhwa', Manhua: 'Manhua' };
  const label = (categoryName && labels[categoryName]) || categoryName || 'Danh mục';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <Link to="/ntr" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-4 transition-colors">
        <FiArrowLeft size={15} /> Trang chủ
      </Link>

      <SectionHeader title={label} count={loading ? undefined : mangas.length} />

      {loading ? (
        <div className="manga-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3]" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : mangas.length === 0 ? (
        <EmptyState title="Chưa có truyện nào" description={`Danh mục “${label}” hiện chưa có truyện.`} actionLabel="Về trang chủ" actionTo="/ntr" />
      ) : (
        <MangaGrid mangas={mangas} />
      )}
    </div>
  );
};

export default CategoryPage;
