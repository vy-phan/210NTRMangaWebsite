import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMangaBySlugAPI, getRelatedMangasAPI } from '../../api/mangaApi';
import { getChaptersByMangaIdAPI } from '../../api/chapterApi';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useFollowStore } from '../lib/followStore';
import { useProgressStore, getReadSet } from '../lib/progressStore';
import { relativeTime, statusLabel, absoluteDate, chapterLabel } from '../lib/format';
import { slugify } from '../../utils/slugify';
import {
  FiArrowLeft, FiChevronDown, FiChevronUp, FiUser, FiSearch,
  FiBookOpen, FiBookmark, FiSliders, FiX,
} from 'react-icons/fi';
import Skeleton from '../components/Skeleton';
import MangaGrid from '../components/MangaGrid';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import FallbackImg from '../components/FallbackImg';

const DetailMangaPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [related, setRelated] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [chapterQuery, setChapterQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false); // mặc định: mới trước
  const [showStickyBar, setShowStickyBar] = useState(false);

  const history = useHistoryStore((s) => s.history);
  const follows = useFollowStore((s) => s.follows);
  const toggleFollow = useFollowStore((s) => s.toggleFollow);
  // subscribe để danh sách chương mờ theo tiến độ đọc
  const progressData = useProgressStore((s) => s.data);

  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    setLoading(true);
    window.scrollTo({ top: 0 });

    (async () => {
      try {
        const data = await getMangaBySlugAPI(slug);
        if (!mounted) return;
        setManga(data);

        const [chData] = await Promise.allSettled([getChaptersByMangaIdAPI(data._id)]);
        if (chData.status === 'fulfilled' && mounted) setChapters(chData.value);

        if (data.genres?.length) {
          const genreIds = data.genres.map((g) => (typeof g === 'string' ? g : g._id));
          const rel = await getRelatedMangasAPI(data._id, genreIds);
          if (mounted) setRelated(rel.slice(0, 6));
        }
      } catch (err) {
        console.error('DetailManga fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [slug]);

  // Thanh "Đọc tiếp" dính khi cuộn qua nút chính (mobile)
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [manga, loading]);

  const historyItem = useMemo(
    () => (manga ? history.find((h) => h.mangaId === manga._id) : undefined),
    [history, manga]
  );
  const isFollowed = !!(manga && follows[manga._id]);

  const sortedChapters = useMemo(() => {
    let list = [...chapters];
    if (chapterQuery.trim()) {
      const q = chapterQuery.trim().toLowerCase();
      list = list.filter((c) => String(c.number).includes(q) || (c.title || '').toLowerCase().includes(q));
    }
    list.sort((a, b) => (sortAsc ? a.number - b.number : b.number - a.number));
    return list;
  }, [chapters, chapterQuery, sortAsc]);

  const firstChapter = useMemo(() => {
    if (!chapters.length) return null;
    return [...chapters].sort((a, b) => a.number - b.number)[0];
  }, [chapters]);

  // Nút chính: có lịch sử → "Đọc tiếp", chưa có → "Đọc từ đầu"; 1 chương = Oneshot
  const isOneshot = chapters.length === 1;
  const readTarget = useMemo(() => {
    if (historyItem) {
      return { number: historyItem.chapterNumber, label: `Đọc tiếp — ${chapterLabel(historyItem.chapterNumber, historyItem.chapterTitle)}` };
    }
    if (firstChapter) {
      return {
        number: firstChapter.number,
        label: isOneshot ? 'Đọc Oneshot' : 'Đọc từ đầu',
      };
    }
    return null;
  }, [historyItem, firstChapter, isOneshot]);

  const readSet = useMemo(() => {
    void progressData;
    return manga ? getReadSet(manga._id) : new Set<number>();
  }, [manga, progressData]);

  // Chương đang đọc dở: ưu tiên lịch sử, fallback vị trí lưu mới nhất
  const readingChapter = useMemo(() => {
    if (historyItem) return historyItem.chapterNumber;
    if (!manga) return null;
    const pos = progressData[manga._id]?.pos;
    if (!pos) return null;
    let best: number | null = null;
    let bestAt = 0;
    Object.entries(pos).forEach(([k, v]) => {
      if (v.at > bestAt) {
        bestAt = v.at;
        best = Number(k);
      }
    });
    return best;
  }, [historyItem, manga, progressData]);

  const genreList = useMemo(() => {
    if (!manga?.genres) return [];
    return manga.genres.map((g) => (typeof g === 'string' ? { _id: g, name: g, slug: slugify(g) } : g));
  }, [manga]);

  const handleFollow = () => {
    if (!manga) return;
    const entry = toggleFollow(manga);
    toast.success(entry ? 'Đã theo dõi' : 'Đã bỏ theo dõi');
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-4 md:gap-6">
          <Skeleton className="w-28 md:w-44 aspect-[2/3] shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          title="Không tìm thấy truyện"
          description="Truyện này có thể đã bị xóa hoặc đường dẫn không đúng."
          actionLabel="Về trang chủ"
          actionTo="/ntr"
        />
      </div>
    );
  }

  const latestChapter = chapters.length ? [...chapters].sort((a, b) => b.number - a.number)[0] : null;

  return (
    <div className="pb-24 md:pb-10">
      {/* Đầu trang: bìa làm mờ rất nhẹ phía sau */}
      <div className="relative overflow-hidden">
        {manga.poster && (
          <FallbackImg
            src={manga.poster}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-[0.08] blur-2xl scale-110 pointer-events-none"
          />
        )}
        <div className="relative max-w-4xl mx-auto px-4 pt-4 md:pt-8">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost !min-h-0 !py-2 !px-3 text-sm mb-4"
          >
            <FiArrowLeft size={15} /> Quay lại
          </button>

          <div className="flex flex-col sm:flex-row gap-5 md:gap-7">
            {/* Bìa */}
            <div className="w-32 sm:w-40 md:w-48 shrink-0 mx-auto sm:mx-0">
              <div className="cover !rounded-[10px]" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.18)' }}>
                <FallbackImg src={manga.poster} alt={manga.title} />
              </div>
            </div>

            {/* Thông tin */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight text-ink">{manga.title}</h1>

              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[13px] text-ink-muted">
                {manga.author && (
                  <span className="inline-flex items-center gap-1.5">
                    <FiUser size={13} /> {manga.author}
                  </span>
                )}
                {manga.status && <span>{statusLabel(manga.status)}</span>}
                {chapters.length > 0 && <span>{isOneshot ? 'Oneshot' : `${chapters.length} chương`}</span>}
                {manga.createdAt && <span>{absoluteDate(manga.createdAt)}</span>}
              </div>

              {/* Chip thể loại */}
              {genreList.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
                  {genreList.map((g) => (
                    <Link key={g._id} to={`/ntr/genre/${g.slug}`} className="chip !py-1 !px-3 !text-xs">
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Mô tả thu gọn */}
              {manga.description && (
                <div className="mt-3">
                  <p className={`text-sm leading-relaxed text-ink-muted ${descExpanded ? '' : 'line-clamp-3'}`}>
                    {manga.description}
                  </p>
                  {manga.description.length > 160 && (
                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="mt-1 text-[13px] font-semibold text-accent inline-flex items-center gap-1"
                    >
                      {descExpanded ? <>Thu gọn <FiChevronUp size={14} /></> : <>Xem thêm <FiChevronDown size={14} /></>}
                    </button>
                  )}
                </div>
              )}

              {/* Nút chính */}
              <div ref={ctaRef} className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                {readTarget && (
                  <Link
                    to={`/ntr/manga/${manga.slug}/chapter/${readTarget.number}`}
                    className="btn-primary"
                  >
                    <FiBookOpen size={16} /> {readTarget.label}
                  </Link>
                )}
                {latestChapter && (!readTarget || latestChapter.number !== readTarget.number) && (
                  <Link
                    to={`/ntr/manga/${manga.slug}/chapter/${latestChapter.number}`}
                    className="btn-ghost"
                  >
                    Chương mới nhất
                  </Link>
                )}
                <button onClick={handleFollow} className={`btn-ghost ${isFollowed ? 'chip-active !border-accent' : ''}`}>
                  <FiBookmark size={15} className={isFollowed ? 'fill-current' : ''} />
                  {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách chương */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="font-display text-lg font-bold text-ink">
            {isOneshot ? 'Oneshot' : 'Chương truyện'} <span className="text-sm font-normal text-ink-muted">({chapters.length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                value={chapterQuery}
                onChange={(e) => setChapterQuery(e.target.value)}
                placeholder="Lọc theo số chương…"
                className="input !py-1.5 !min-h-0 !pl-8 !w-44 text-[13px]"
              />
              {chapterQuery && (
                <button onClick={() => setChapterQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted" aria-label="Xóa lọc">
                  <FiX size={13} />
                </button>
              )}
            </div>
            <button onClick={() => setSortAsc(!sortAsc)} className="btn-ghost !min-h-0 !py-1.5 !px-3 !text-[13px]">
              <FiSliders size={13} /> {sortAsc ? 'Cũ trước' : 'Mới trước'}
            </button>
          </div>
        </div>

        <div className="surface divide-y" style={{ borderColor: 'var(--line)' }}>
          {sortedChapters.length === 0 ? (
            <p className="text-sm text-ink-muted px-4 py-8 text-center">
              {chapterQuery ? 'Không có chương khớp bộ lọc.' : 'Chưa có chương nào.'}
            </p>
          ) : (
            sortedChapters.map((ch) => {
              const read = readSet.has(ch.number);
              const isReading = ch.number === readingChapter;
              return (
                <Link
                  key={ch._id}
                  id={`ch-row-${ch.number}`}
                  to={`/ntr/manga/${manga.slug}/chapter/${ch.number}`}
                  className={`flex items-center gap-3 min-h-[48px] px-4 py-2.5 transition-colors hover:bg-surface-2 ${
                    isReading ? 'bg-accent-soft' : read ? 'opacity-55' : ''
                  }`}
                >
                  <span
                    className="w-9 shrink-0 text-center text-[13px] font-semibold rounded-md py-1"
                    style={{
                      background: isReading ? 'var(--accent)' : 'var(--surface-2)',
                      color: isReading ? '#fff' : 'var(--ink-muted)',
                    }}
                  >
                    {ch.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm truncate ${isReading ? 'text-accent font-bold' : 'text-ink font-medium'}`}>
                      {chapterLabel(ch.number, ch.title)}
                    </span>
                  </span>
                  {isReading ? (
                    <span className="shrink-0 text-[11px] font-bold text-accent px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)' }}>
                      Đang đọc
                    </span>
                  ) : (
                    <span className="hidden sm:block text-xs text-ink-muted shrink-0">
                      {ch.createdAt ? relativeTime(ch.createdAt) : ''}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Truyện tương tự */}
      {related.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-10 mb-6">
          <SectionHeader title="Truyện tương tự" />
          <MangaGrid mangas={related} />
        </div>
      )}

      {/* Thanh đọc dính (mobile, khi nút chính đã cuộn khuất) */}
      {showStickyBar && readTarget && (
        <div className="md:hidden fixed left-0 right-0 z-40 bg-surface border-t border-line px-4 py-2.5 pb-safe"
          style={{ bottom: 'calc(57px + env(safe-area-inset-bottom, 0px))' }}>
          <Link to={`/ntr/manga/${manga.slug}/chapter/${readTarget.number}`} className="btn-primary w-full !min-h-11">
            <FiBookOpen size={16} /> {readTarget.label}
          </Link>
        </div>
      )}
    </div>
  );
};

export default DetailMangaPage;
