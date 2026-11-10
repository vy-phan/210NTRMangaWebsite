import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getAllMangasAPI } from '../../api/mangaApi';
import SectionHeader from '../components/SectionHeader';
import UpdateRow from '../components/UpdateRow';
import Skeleton from '../components/Skeleton';

const PAGE_SIZE = 20;

const latestChapterTime = (m: Manga): number => {
  const t = m.latestChapters?.[0]?.createdAt;
  return t ? new Date(t).getTime() : m.updatedAt ? new Date(m.updatedAt).getTime() : 0;
};

// Cuộn vô hạn phía client: API trả toàn bộ, ta phân trang hiển thị
const UpdatesPage: React.FC = () => {
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
    () => [...mangas].sort((a, b) => latestChapterTime(b) - latestChapterTime(a)),
    [mangas]
  );
  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisible((v) => v + PAGE_SIZE);
        }
      },
      { rootMargin: '600px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, visible]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      <SectionHeader title="Mới cập nhật" count={loading ? undefined : sorted.length} />
      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-3 py-3">
              <Skeleton className="w-16 shrink-0 aspect-[2/3]" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-ink-muted py-10 text-center">Chưa có truyện nào.</p>
      ) : (
        <>
          <div>
            {shown.map((m) => (
              <UpdateRow key={m._id} manga={m} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-8" />
          {!hasMore && sorted.length > PAGE_SIZE && (
            <p className="text-center text-xs text-ink-muted py-4">Đã hiển thị hết {sorted.length} truyện.</p>
          )}
        </>
      )}
    </div>
  );
};

export default UpdatesPage;
