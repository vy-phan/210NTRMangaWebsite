import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getAllMangasAPI } from '../../api/mangaApi';
import SectionHeader from '../components/SectionHeader';
import MangaGrid from '../components/MangaGrid';
import Skeleton from '../components/Skeleton';

const PAGE_SIZE = 24;

const NewMangaPage: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllMangasAPI()
      .then(setMangas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(
    () =>
      [...mangas].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }),
    [mangas]
  );
  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) setVisible((v) => v + PAGE_SIZE);
      },
      { rootMargin: '600px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, visible]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <SectionHeader title="Truyện mới" count={loading ? undefined : sorted.length} />
      {loading ? (
        <div className="manga-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3]" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-ink-muted py-10 text-center">Chưa có truyện mới.</p>
      ) : (
        <>
          <MangaGrid mangas={shown} />
          <div ref={sentinelRef} className="h-8" />
          {!hasMore && sorted.length > PAGE_SIZE && (
            <p className="text-center text-xs text-ink-muted py-4">Đã hiển thị hết {sorted.length} truyện.</p>
          )}
        </>
      )}
    </div>
  );
};

export default NewMangaPage;
