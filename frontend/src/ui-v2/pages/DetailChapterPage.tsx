import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getChapterByNumberAPI, getChaptersByMangaIdAPI } from '../../api/chapterApi';
import { getMangaBySlugAPI } from '../../api/mangaApi';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useUiStore } from '../lib/uiStore';
import { useProgressStore, getSavedPos } from '../lib/progressStore';
import { chapterLabel } from '../lib/format';
import { getChapterOffline } from '../../utils/offlineDB';
import ReaderImage from '../components/ReaderImage';
import {
  FiArrowLeft, FiChevronLeft, FiChevronRight, FiSettings,
  FiBookOpen, FiRefreshCw, FiWifiOff, FiList, FiGlobe,
} from 'react-icons/fi';
import ChapterSheet from '../components/ChapterSheet';
import ReaderSettingsSheet from '../components/ReaderSettingsSheet';
import TranslatePopup from '../components/TranslatePopup';
import '../styles/theme.css';
import '../lib/uiStore';

const PAGE_SAVE_DELAY = 600;

const DetailChapterPage: React.FC = () => {
  const { slug, chapterNumber } = useParams<{ slug: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const chapterNum = Number(chapterNumber);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [mangaInfo, setMangaInfo] = useState<Manga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const readerWidth = useUiStore((s) => s.readerWidth);

  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [translateOpen, setTranslateOpen] = useState(false);
  const [chapterSheetOpen, setChapterSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [restored, setRestored] = useState(false);

  const { addToHistory } = useHistoryStore();

  const images = useMemo(() => chapter?.images || [], [chapter]);
  const totalPages = images.length;

  // Backend lưu chapter.number 0-based → URL/hiển thị = number + 1
  const dbChapterNum = chapterNum - 1;

  const sortedChapters = useMemo(() => [...chapterList].sort((a, b) => a.number - b.number), [chapterList]);
  const currentIndex = sortedChapters.findIndex((c) => c.number === dbChapterNum);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  // chapter.manga có thể là string id hoặc object populate
  const rawManga = chapter?.manga as unknown;
  const mangaId =
    (typeof rawManga === 'string' ? rawManga : (rawManga as { _id?: string })?._id) ||
    mangaInfo?._id ||
    '';

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!slug || !chapterNum) return;
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await getChapterByNumberAPI(slug, dbChapterNum);
      if (res?.chapter) {
        setChapter(res.chapter);
        setIsOfflineMode(false);
        const mid =
          typeof res.chapter.manga === 'string'
            ? res.chapter.manga
            : (res.chapter.manga as unknown as { _id?: string })?._id;
        if (mid) {
          getChaptersByMangaIdAPI(mid).then(setChapterList).catch(() => {});
        }
        getMangaBySlugAPI(slug)
          .then((m) => {
            setMangaInfo(m);
            addToHistory(m, {
              _id: res.chapter._id,
              number: res.chapter.number + 1, // lưu số hiển thị (1-based)
              title: res.chapter.title,
            });
          })
          .catch(() => {});
      } else {
        throw new Error('empty');
      }
    } catch (err) {
      try {
        const offline = await getChapterOffline(slug, dbChapterNum);
        if (offline) {
          setChapter(offline as unknown as Chapter);
          setIsOfflineMode(true);
          toast('Đang đọc bản lưu ngoại tuyến');
        } else {
          throw err;
        }
      } catch {
        setLoadError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [slug, chapterNum, addToHistory]);

  useEffect(() => {
    setChapter(null);
    setChapterList([]);
    setMangaInfo(null);
    setCurrentPage(0);
    setRestored(false);
    setToolbarVisible(true);
    setSettingsOpen(false);
    setChapterSheetOpen(false);
    window.scrollTo(0, 0);
    load();
  }, [load]);

  // ─── Lưu tiến độ (debounce 600ms) ─────────────────────────────────────────
  useEffect(() => {
    if (!mangaId || totalPages === 0 || !restored) return;
    const t = setTimeout(() => {
      useProgressStore.getState().savePos(mangaId, chapterNum, currentPage, totalPages);
      if (currentPage >= totalPages - 2) {
        useProgressStore.getState().markRead(mangaId, chapterNum);
      }
    }, PAGE_SAVE_DELAY);
    return () => clearTimeout(t);
  }, [currentPage, mangaId, chapterNum, totalPages, restored]);

  // ─── Quan sát trang ở giữa màn hình ──────────────────────────────────────
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (!totalPages) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const idx = Number((en.target as HTMLElement).dataset.pageIdx);
            if (!Number.isNaN(idx)) setCurrentPage(idx);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    pageRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [totalPages, chapterNum]);

  // ─── Khôi phục vị trí đọc (một lần mỗi chương) ────────────────────────────
  const scrollRestoreAttempts = useRef(0);
  const doRestoreScroll = useCallback(() => {
    if (!mangaId || !chapter || restored) return;
    const saved = getSavedPos(mangaId, chapterNum);
    if (!saved) {
      setRestored(true);
      return;
    }
    scrollRestoreAttempts.current += 1;
    const el = pageRefs.current[Math.min(saved.page, totalPages - 1)];
    if (el) el.scrollIntoView({ block: 'start' });
    if (scrollRestoreAttempts.current >= 6) setRestored(true);
  }, [mangaId, chapter, restored, chapterNum, totalPages]);

  useEffect(() => {
    if (!chapter || !mangaId || restored || totalPages === 0) return;
    const t = setTimeout(doRestoreScroll, 120);
    return () => clearTimeout(t);
  }, [chapter, mangaId, chapterNum, totalPages, restored, doRestoreScroll]);

  // Ảnh load xong → cuộn lại đúng trang đã lưu (vài lần đầu, layout còn thay đổi)
  const handlePageLoaded = useCallback(() => {
    if (restored || !mangaId || !chapter) return;
    const saved = getSavedPos(mangaId, chapterNum);
    if (!saved) {
      setRestored(true);
      return;
    }
    doRestoreScroll();
  }, [restored, mangaId, chapterNum, chapter, doRestoreScroll]);

  // ─── Toolbar tự ẩn khi cuộn xuống ─────────────────────────────────────────
  const lastY = useRef(0);
  const onScroll = useCallback(() => {
    const y = window.scrollY;
    const dy = y - lastY.current;
    lastY.current = y;
    if (dy > 24) setToolbarVisible(false);
    else if (dy < -24) setToolbarVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const toggleToolbar = useCallback(() => setToolbarVisible((v) => !v), []);

  // ─── Bàn phím ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft' && prevChapter) navigate(`/ntr/manga/${slug}/chapter/${prevChapter.number + 1}`);
      if (e.key === 'ArrowRight' && nextChapter) navigate(`/ntr/manga/${slug}/chapter/${nextChapter.number + 1}`);
      if (e.key === '[' && prevChapter) navigate(`/ntr/manga/${slug}/chapter/${prevChapter.number + 1}`);
      if (e.key === ']' && nextChapter) navigate(`/ntr/manga/${slug}/chapter/${nextChapter.number + 1}`);
      if (e.key.toLowerCase() === 'm') setToolbarVisible((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevChapter, nextChapter, slug, navigate]);

  const pageLabel = totalPages > 0 ? `${currentPage + 1}/${totalPages}` : '—';
  const chapterTitle = chapterLabel(chapterNum, chapter?.title);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="reader-page min-h-[100dvh] flex flex-col" style={{ background: 'var(--reader-bg)', color: 'var(--reader-ink)' }}>
      {/* Thanh trên */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-200 ${toolbarVisible ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ background: 'rgba(11,12,16,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--reader-line)' }}
      >
        <div className="relative max-w-6xl mx-auto px-3 h-14 flex items-center gap-1">
          <Link
            to={`/ntr/manga/${slug}`}
            className="p-2 rounded-lg reader-muted hover:text-white transition-colors"
            aria-label="Về trang truyện"
          >
            <FiArrowLeft size={18} />
          </Link>
          <Link
            to={`/ntr/manga/${slug}`}
            className="flex-1 min-w-0 px-1 py-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label={`Về trang truyện: ${mangaInfo?.title || slug}`}
          >
            <p className="text-[12px] font-bold truncate leading-tight">{chapterTitle}</p>
            <p className="text-[10px] reader-muted truncate leading-tight hidden sm:block">{mangaInfo?.title || slug}</p>
          </Link>
          {isOfflineMode && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border shrink-0" style={{ color: '#f5b14c', borderColor: '#f5b14c55' }}>
              <FiWifiOff size={11} /> Offline
            </span>
          )}
          {/* Danh sách chương - căn giữa header */}
          <button
            onClick={() => setChapterSheetOpen(true)}
            className="absolute left-1/2 -translate-x-1/2 p-2 rounded-lg reader-muted hover:text-white transition-colors shrink-0"
            aria-label="Danh sách chương"
            title="Danh sách chương"
          >
            <FiList size={18} />
          </button>
          <button
            onClick={() => setTranslateOpen((v) => !v)}
            className={`p-2 rounded-lg transition-colors shrink-0 ${translateOpen ? 'text-accent' : 'reader-muted hover:text-white'}`}
            aria-label="Tra từ Anh - Việt"
            title="Tra từ Anh - Việt"
          >
            <FiGlobe size={18} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg reader-muted hover:text-white transition-colors shrink-0"
            aria-label="Cài đặt trình đọc"
          >
            <FiSettings size={18} />
          </button>
        </div>
      </div>

      {/* Nội dung đọc */}
      <div className="flex-1 pt-14 pb-20">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-3">
            <span className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--reader-line)', borderTopColor: 'var(--accent)' }} />
            <p className="text-sm reader-muted">Đang tải chương…</p>
          </div>
        ) : loadError ? (
          <div className="py-24 flex flex-col items-center gap-4 text-center px-6">
            <p className="text-sm reader-muted">Không tải được chương này. Kiểm tra mạng rồi thử lại.</p>
            <button onClick={load} className="btn-primary">
              <FiRefreshCw size={15} /> Tải lại
            </button>
          </div>
        ) : !chapter || totalPages === 0 ? (
          <div className="py-24 text-center text-sm reader-muted">Chưa có hình ảnh nào cho chương này.</div>
        ) : (
          <div
            className="mx-auto flex flex-col items-center"
            style={{ maxWidth: readerWidth }}
            onClick={toggleToolbar}
          >
            {images.map((img, idx) => (
              <div
                key={img.pageNumber ?? idx}
                data-page-idx={idx}
                ref={(el) => { pageRefs.current[idx] = el; }}
                className="w-full"
              >
                <ReaderImage
                  src={img.url}
                  alt={`Trang ${img.pageNumber || idx + 1}`}
                  eager={idx < 2}
                  onLoaded={handlePageLoaded}
                />
              </div>
            ))}

            {/* Thẻ hết chương */}
            <div
              className="w-full surface !rounded-2xl p-8 my-4 text-center"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <FiBookOpen size={28} className="mx-auto mb-3 text-accent" />
              <h3 className="font-display text-lg font-bold text-ink">Hết {chapterTitle}</h3>
              {nextChapter ? (
                <Link
                  to={`/ntr/manga/${slug}/chapter/${nextChapter.number + 1}`}
                  className="btn-primary mt-4"
                >
                  Chương tiếp theo <FiChevronRight size={16} />
                </Link>
              ) : (
                <p className="text-sm text-rind mt-2 font-semibold">Đây là chương mới nhất.</p>
              )}
              <Link to={`/ntr/manga/${slug}`} className="btn-ghost mt-2">
                Về trang truyện
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Thanh dưới: chuyển chương */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-200 ${toolbarVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'rgba(11,12,16,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--reader-line)' }}
      >
        <div className="max-w-6xl mx-auto px-3 h-16 flex items-center justify-between gap-3">
          <button
            disabled={!prevChapter}
            onClick={() => prevChapter && navigate(`/ntr/manga/${slug}/chapter/${prevChapter.number + 1}`)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold reader-muted hover:text-white disabled:opacity-30 transition-colors"
            style={{ border: '1px solid var(--reader-line)' }}
          >
            <FiChevronLeft size={20} /> <span>Chương trước</span>
          </button>
          <span className="text-xs reader-muted tabular-nums shrink-0">{pageLabel}</span>
          <button
            disabled={!nextChapter}
            onClick={() => nextChapter && navigate(`/ntr/manga/${slug}/chapter/${nextChapter.number + 1}`)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-30"
            style={{ background: 'var(--accent)' }}
          >
            <span>Chương sau</span> <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Popup dịch Anh - Việt */}
      <TranslatePopup isOpen={translateOpen} onClose={() => setTranslateOpen(false)} />

      {/* Ngăn kéo cài đặt trình đọc */}
      {settingsOpen && <ReaderSettingsSheet onClose={() => setSettingsOpen(false)} />}

      {/* Ngăn kéo danh sách chương */}
      {chapterSheetOpen && (
        <ChapterSheet
          slug={slug!}
          chapters={chapterList}
          currentNumber={chapterNum}
          mangaId={mangaId}
          onClose={() => setChapterSheetOpen(false)}
        />
      )}
    </div>
  );
};

export default DetailChapterPage;
