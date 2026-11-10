import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllMangasAPI } from '../../api/mangaApi';
import { getAllGenresAPI } from '../../api/genreApi';
import { getBannersAPI } from '../../api/bannerApi';
import Skeleton from '../components/Skeleton';
import SectionHeader from '../components/SectionHeader';
import MangaGrid from '../components/MangaGrid';
import UpdateRow from '../components/UpdateRow';
import ContinueStrip from '../components/ContinueStrip';
import FallbackImg from '../components/FallbackImg';

const latestChapterTime = (m: Manga): number => {
  const t = m.latestChapters?.[0]?.createdAt;
  return t ? new Date(t).getTime() : m.updatedAt ? new Date(m.updatedAt).getTime() : 0;
};

// Banner.link có thể là path UI cũ (/manga/...) hoặc ngoài — map sang /ntr khi nội bộ
const bannerHref = (link?: string): { to?: string; href?: string } => {
  if (!link) return {};
  if (/^https?:\/\//i.test(link)) return { href: link };
  const prefixes: [string, string][] = [
    ['/manga/', '/ntr/manga/'],
    ['/category/', '/ntr/category/'],
    ['/genre/', '/ntr/genre/'],
    ['/search', '/ntr/search'],
    ['/history', '/ntr/history'],
  ];
  for (const [from, to] of prefixes) {
    if (link.startsWith(from)) return { to: to + link.slice(from.length) };
  }
  if (link.startsWith('/ntr')) return { to: link };
  if (link.startsWith('/')) return { to: '/ntr' };
  return { to: `/ntr/manga/${link}` };
};

const BannerStrip: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  if (!banners.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-1">
      {banners.slice(0, 6).map((b) => {
        const { to, href } = bannerHref(b.link);
        const inner = (
          <div className="relative w-[82vw] sm:w-[380px] md:w-[440px] shrink-0 snap-start rounded-2xl overflow-hidden surface !border-0" style={{ height: 150 }}>
            <FallbackImg src={b.bannerImg} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11,12,16,0.85), rgba(11,12,16,0.15) 60%, transparent)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="font-display font-bold text-white text-base leading-tight line-clamp-1">{b.title}</p>
              <p className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--accent)' }}>Đọc ngay →</p>
            </div>
          </div>
        );
        return to ? (
          <Link key={b._id} to={to}>{inner}</Link>
        ) : href ? (
          <a key={b._id} href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
        ) : (
          <div key={b._id}>{inner}</div>
        );
      })}
    </div>
  );
};

const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [bRes, mRes, gRes] = await Promise.allSettled([
        getBannersAPI(),
        getAllMangasAPI(),
        getAllGenresAPI(),
      ]);
      if (!mounted) return;
      if (bRes.status === 'fulfilled') setBanners(bRes.value.filter((b) => b.active !== false));
      if (mRes.status === 'fulfilled') setMangas(mRes.value);
      if (gRes.status === 'fulfilled') setGenres(gRes.value);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const updated = useMemo(
    () => [...mangas].sort((a, b) => latestChapterTime(b) - latestChapterTime(a)),
    [mangas]
  );
  const newest = useMemo(
    () =>
      [...mangas].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }),
    [mangas]
  );
  const topGenres = useMemo(() => [...genres].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 14), [genres]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 md:py-8">
      {/* Banner */}
      {!loading && banners.length > 0 && (
        <section className="mb-6">
          <BannerStrip banners={banners} />
        </section>
      )}

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        {/* Cột trái: Đọc tiếp + Mới cập nhật */}
        <div className="space-y-8 min-w-0">
          <ContinueStrip />

          <section>
            <SectionHeader title="Mới cập nhật" count={loading ? undefined : updated.length} linkTo="/ntr/updates" />
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
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
            ) : updated.length === 0 ? (
              <p className="text-sm text-ink-muted py-6">Chưa có truyện nào.</p>
            ) : (
              <div>
                {updated.slice(0, 12).map((m) => (
                  <UpdateRow key={m._id} manga={m} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Cột phải: Thể loại + Truyện mới */}
        <div className="space-y-8 mt-8 lg:mt-0 min-w-0">
          <section>
            <SectionHeader title="Thể loại" linkTo="/ntr/genre" />
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            ) : topGenres.length === 0 ? null : (
              <div className="flex flex-wrap gap-2">
                {topGenres.map((g) => (
                  <Link key={g._id} to={`/ntr/genre/${g.slug}`} className="chip">
                    {g.name}
                    {g.count ? <span className="text-[11px] opacity-70">{g.count}</span> : null}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <SectionHeader title="Truyện mới" count={loading ? undefined : newest.length} linkTo="/ntr/new" />
            {loading ? (
              <div className="manga-grid-sm">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-[2/3]" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : newest.length === 0 ? (
              <p className="text-sm text-ink-muted py-6">Chưa có truyện mới.</p>
            ) : (
              <MangaGrid mangas={newest.slice(0, 6)} size="sm" />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
