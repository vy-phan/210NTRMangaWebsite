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
  FiX, FiBookOpen, FiRefreshCw, FiWifiOff, FiPlay, FiPause, FiList,
} from 'react-icons/fi';
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
  const readerGap = useUiStore((s) => s.readerGap);

  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chapterSheetOpen, setChapterSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [restored, setRestored] = useState(false);

  // Auto scroll (page-down)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoScrollTimeRef = useRef(0);

  const { addToHistory } = useHistoryStore();

  const images = useMemo(() => chapter?.images || [], [chapter]);
  const totalPages = images.length;

  const sortedChapters = useMemo(() => [...chapterList].sort((a, b) => a.number - b.number), [chapterList]);
  const currentIndex = sortedChapters.findIndex((c) => c.number === chapterNum);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex >= 0 && currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null;

  const mangaId = chapter?.manga || mangaInfo?._id || '';

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!slug || !chapterNum) return;
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await getChapterByNumberAPI(slug, chapterNum);
      if (res?.chapter) {
        setChapter(res.chapter);
        setIsOfflineMode(false);
        if (res.chapter.manga) {
          getChaptersByMangaIdAPI(res.chapter.manga).then(setChapterList).catch(() => {});
        }
        getMangaBySlugAPI(slug)
          .then((m) => {
            setMangaInfo(m);
            addToHistory(m, { _id: res.chapter._id, number: res.chapter.number, title: res.chapter.title });
          })
          .catch(() => {});
      } else {
        throw new Error('empty');
      }
    } catch (err) {
      try {
        const offline = await getChapterOffline(slug, chapterNum);
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
    setIsAutoScrolling(false);
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

  // ─── Auto scroll (page down) ──────────────────────────────────────────────
  useEffect(() => {
    if (isAutoScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        const winH = window.innerHeight;
        const docH = document.body.scrollHeight;
        if (window.scrollY + winH >= docH - 50) {
          setIsAutoScrolling(false);
          toast('Đã cuộn đến cuối trang');
          if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
          return;
        }
        lastAutoScrollTimeRef.current = Date.now();
        window.scrollBy({ top: winH * 0.9, behavior: 'smooth' });
      }, 5000);
    } else if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isAutoScrolling]);

  const handleUserScroll = useCallback(() => {
    if (isAutoScrolling && Date.now() - lastAutoScrollTimeRef.current > 1000) {
      setIsAutoScrolling(false);
    }
  }, [isAutoScrolling]);

  useEffect(() => {
    window.addEventListener('scroll', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    };
  }, [handleUserScroll]);

  // ─── Bàn phím ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === 'ArrowLeft' && prevChapter) navigate(`/ntr/manga/${slug}/chapter/${prevChapter.number}`);
      if (e.key === 'ArrowRight' && nextChapter) navigate(`/ntr/manga/${slug}/chapter/${nextChapter.number}`);
      if (e.key === '[' && prevChapter) navigate(`/ntr/manga/${slug}/chapter/${prevChapter.number}`);
      if (e.key === ']' && nextChapter) navigate(`/ntr/manga/${slug}/chapter/${nextChapter.number}`);
      if (e.key.toLowerCase() === 'm') setToolbarVisible((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevChapter, nextChapter, slug, navigate]);

  const progressPct = totalPages === 0 ? 0 : Math.min(100, (currentPage / Math.max(1, totalPages - 1)) * 100);
  const chapterTitle = chapterLabel(chapterNum, chapter?.title);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="reader-page min-h-[100dvh] flex flex-col" style={{ background: 'var(--reader-bg)', color: 'var(--reader-ink)' }}>
      {/* Thanh trên */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-200 ${toolbarVisible ? 'translate-y-0' : '-translate-y-full'}`}
        style={{ background: 'rgba(11,12,16,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--reader-line)' }}
      >
        <div className="max-w-6xl mx-auto px-3 h-12 flex items-center gap-1">
          <Link
            to={`/ntr/manga/${slug}`}
            className="p-2 rounded-lg reader-muted hover:text-white transition-colors"
            aria-label="Về trang truyện"
          >
            <FiArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0 px-1">
            <p className="text-[13px] font-bold truncate">{chapterTitle}</p>
            <p className="text-[11px] reader-muted truncate">{mangaInfo?.title || slug}</p>
          </div>
          {isOfflineMode && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border shrink-0" style={{ color: '#f5b14c', borderColor: '#f5b14c55' }}>
              <FiWifiOff size={11} /> Offline
            </span>
          )}
          {/* Chương trước / Chương sau */}
          <button
            disabled={!prevChapter}
            onClick={() => prevChapter && navigate(`/ntr/manga/${slug}/chapter/${prevChapter.number}`)}
            className="p-2 rounded-lg reader-muted hover:text-white disabled:opacity-30 transition-colors shrink-0"
            aria-label="Chương trước"
            title="Chương trước"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            disabled={!nextChapter}
            onClick={() => nextChapter && navigate(`/ntr/manga/${slug}/chapter/${nextChapter.number}`)}
            className="p-2 rounded-lg reader-muted hover:text-white disabled:opacity-30 transition-colors shrink-0"
            aria-label="Chương sau"
            title="Chương sau"
          >
            <FiChevronRight size={18} />
          </button>
          {/* Danh sách chương */}
          <button
            onClick={() => setChapterSheetOpen(true)}
            className="p-2 rounded-lg reader-muted hover:text-white transition-colors shrink-0"
            aria-label="Danh sách chương"
            title="Danh sách chương"
          >
            <FiList size={18} />
          </button>
          <button
            onClick={() => setIsAutoScrolling((v) => !v)}
            className={`p-2 rounded-lg transition-colors shrink-0 ${isAutoScrolling ? 'text-accent' : 'reader-muted hover:text-white'}`}
            aria-label={isAutoScrolling ? 'Dừng tự cuộn' : 'Tự cuộn trang'}
            title={isAutoScrolling ? 'Dừng tự cuộn' : 'Tự cuộn trang'}
          >
            {isAutoScrolling ? <FiPause size={17} /> : <FiPlay size={17} />}
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
            style={{ maxWidth: readerWidth, gap: readerGap }}
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
                  to={`/ntr/manga/${slug}/chapter/${nextChapter.number}`}
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

      {/* Thanh dưới: tiến độ + chuyển chương */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-200 ${toolbarVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'rgba(11,12,16,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--reader-line)' }}
      >
        <div className="h-[3px] w-full" style={{ background: 'var(--reader-line)' }}>
          <div className="h-full transition-all duration-150" style={{ width: `${progressPct}%`, background: 'var(--accent)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-3 h-12 flex items-center justify-between gap-2">
          <button
            disabled={!prevChapter}
            onClick={() => prevChapter && navigate(`/ntr/manga/${slug}/chapter/${prevChapter.number}`)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium reader-muted hover:text-white disabled:opacity-30 transition-colors"
          >
            <FiChevronLeft size={16} /> <span className="hidden sm:inline">Chương trước</span>
          </button>
          <span className="text-xs reader-muted tabular-nums">{totalPages > 0 ? `${currentPage + 1}/${totalPages}` : '—'}</span>
          <button
            disabled={!nextChapter}
            onClick={() => nextChapter && navigate(`/ntr/manga/${slug}/chapter/${nextChapter.number}`)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium reader-muted hover:text-white disabled:opacity-30 transition-colors"
          >
            <span className="hidden sm:inline">Chương sau</span> <FiChevronRight size={16} />
          </button>
        </div>
      </div>

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

// ─── Ngăn kéo cài đặt trình đọc (chỉ cuộn dọc) ──────────────────────────────
const ReaderSettingsSheet: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const readerWidth = useUiStore((s) => s.readerWidth);
  const setReaderWidth = useUiStore((s) => s.setReaderWidth);
  const readerGap = useUiStore((s) => s.readerGap);
  const setReaderGap = useUiStore((s) => s.setReaderGap);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-8 space-y-5"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Cài đặt trình đọc"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-ink">Cài đặt đọc</h3>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink" aria-label="Đóng">
            <FiX size={18} />
          </button>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-ink">Độ rộng tối đa</span>
            <span className="text-ink-muted">{readerWidth}px</span>
          </div>
          <input type="range" min={480} max={1200} step={20} value={readerWidth} onChange={(e) => setReaderWidth(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-ink">Khoảng cách giữa các trang</span>
            <span className="text-ink-muted">{readerGap}px</span>
          </div>
          <input type="range" min={0} max={40} step={4} value={readerGap} onChange={(e) => setReaderGap(Number(e.target.value))} className="w-full accent-[var(--accent)]" />
        </div>
        <p className="text-[11px] text-ink-muted">Cuộn dọc là chế độ đọc mặc định. Chạm vào ảnh để ẩn/hiện thanh công cụ.</p>
      </div>
    </div>
  );
};

// ─── Ngăn kéo danh sách chương ──────────────────────────────────────────────
const ChapterSheet: React.FC<{
  slug: string;
  chapters: Chapter[];
  currentNumber: number;
  mangaId: string;
  onClose: () => void;
}> = ({ slug, chapters, currentNumber, mangaId, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  // subscribe để mờ chương đã đọc
  const progressData = useProgressStore((s) => s.data);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sorted = useMemo(() => {
    void progressData;
    let list = [...chapters].sort((a, b) => b.number - a.number); // mới trước
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) => String(c.number).includes(q) || (c.title || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [chapters, query, progressData]);

  const isRead = (n: number) => !!mangaId && useProgressStore.getState().isRead(mangaId, n);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[75dvh]"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Danh sách chương"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <p className="font-display font-bold text-ink">Chương truyện <span className="text-sm font-normal text-ink-muted">({chapters.length})</span></p>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink" aria-label="Đóng">
            <FiX size={18} />
          </button>
        </div>

        <div className="px-4 py-2.5 border-b border-line">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lọc theo số hoặc tên chương…"
            className="input !py-2 !min-h-0 !text-[13px]"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto p-2 pb-6">
          {sorted.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-8">Không có chương khớp bộ lọc.</p>
          ) : (
            sorted.map((ch) => {
              const current = ch.number === currentNumber;
              const read = isRead(ch.number);
              return (
                <button
                  key={ch._id}
                  onClick={() => {
                    onClose();
                    navigate(`/ntr/manga/${slug}/chapter/${ch.number}`);
                  }}
                  className={`w-full flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl text-left transition-colors ${
                    current ? 'bg-accent-soft' : 'hover:bg-surface-2'
                  } ${read && !current ? 'opacity-55' : ''}`}
                >
                  <span
                    className="w-9 shrink-0 text-center text-[13px] font-semibold rounded-md py-1"
                    style={{
                      background: current ? 'var(--accent)' : 'var(--surface-2)',
                      color: current ? '#fff' : 'var(--ink-muted)',
                    }}
                  >
                    {ch.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm truncate ${current ? 'text-accent font-semibold' : 'text-ink font-medium'}`}>
                      {chapterLabel(ch.number, ch.title)}
                    </span>
                    {ch.createdAt && (
                      <span className="block text-[11px] text-ink-muted">
                        {new Date(ch.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </span>
                  {current && <span className="text-[11px] font-bold text-accent shrink-0">Đang đọc</span>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailChapterPage;
