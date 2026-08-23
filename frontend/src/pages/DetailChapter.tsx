import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getChapterByNumberAPI, getChaptersByMangaIdAPI } from '../api/chapterApi';
import { FiWifiOff } from 'react-icons/fi';
import ChapterNavigation from '../components/manga/ChapterNavigation';
import { useKeyPress } from '../utils/useKeyPress';
import ChapterImage from '../components/manga/ChapterImage';
import ShareChapterModal from '../components/manga/ShareChapterModal';
import { getChapterOffline } from '../utils/offlineDB';
import MangaReaderControls from '../components/manga/MangaReaderControls';
import ReportChapterModal from '../components/manga/ReportChapterModal';
import { useHistoryStore } from '../store/useHistoryStore';
import TranslatePopup from '../components/manga/TranslatePopup';
import ChapterHeader from '../components/manga/ChapterHeader';
import ChapterBreadcrumbs from '../components/manga/ChapterBreadcrumbs';

// Component Skeleton
const ChapterSkeleton = () => (
  <div className="bg-black min-h-screen flex flex-col items-center p-4 animate-pulse">
    <div className="skeleton h-12 w-full max-w-lg mb-8"></div>
    <div className="skeleton h-screen w-full max-w-3xl"></div>
  </div>
);

const DetailChapter = () => {
  const { slug, chapterNumber } = useParams<{ slug: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [currentMangaId, setCurrentMangaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const { addToHistory, updateHistoryChapter } = useHistoryStore();
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);

  // === 1. STATE CHO AUTO SCROLL (PAGE DOWN MODE) ===
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollDelay, setScrollDelay] = useState(5); // Mặc định 5 giây nhảy 1 lần
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAutoScrollTimeRef = useRef(0); // Thời điểm scroll tự động cuối cùng

  const displayChapterNumber = useMemo(() => Number(chapterNumber), [chapterNumber]);
  const chapterIndex = useMemo(() => displayChapterNumber - 1, [displayChapterNumber]);
  const totalChapters = chapterList.length;

  // === REF CHO THANH TIẾN ĐỘ (không dùng state -> không gây re-render khi cuộn) ===
  const progressBarRef = useRef<HTMLDivElement>(null);

  // === 2. LOGIC XỬ LÝ AUTO SCROLL (PAGE DOWN) ===
  useEffect(() => {
    if (isAutoScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        // Tính toán vị trí
        const currentScroll = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.body.scrollHeight;

        // Nếu đã đến cuối trang -> Tự động dừng
        if (currentScroll + windowHeight >= docHeight - 50) { // -50px sai số
          setIsAutoScrolling(false);
          toast("Đã cuộn đến cuối trang");
          if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
          return;
        }

        // Đánh dấu thời điểm scroll tự động
        lastAutoScrollTimeRef.current = Date.now();

        // Thực hiện cuộn "Page Down"
        // Scroll 90% màn hình để giữ lại 1 chút context (10%) của đoạn trước
        window.scrollBy({
          top: windowHeight * 0.9,
          behavior: 'smooth'
        });

      }, scrollDelay * 1000); // Đổi giây sang ms
    } else {
      // Clear interval nếu tắt
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }

    // Cleanup khi component unmount
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isAutoScrolling, scrollDelay]);

  // Lưu và khôi phục vị trí cuộn theo từng chương
  useEffect(() => {
    if (!chapter) return;
    const key = `scroll:${slug}:${chapterNumber}`;
    const saved = sessionStorage.getItem(key);

    let userInterrupted = false;
    const markInterrupted = () => { userInterrupted = true; };

    if (saved) {
      const targetY = Number(saved);
      let attempts = 0;
      const maxAttempts = 8;

      // Nếu user chủ động cuộn/chạm trong lúc đang restore -> dừng ngay, tránh giật lại
      window.addEventListener('wheel', markInterrupted, { once: true, passive: true });
      window.addEventListener('touchstart', markInterrupted, { once: true, passive: true });

      const restoreAndCheck = () => {
        if (userInterrupted) return;
        window.scrollTo(0, targetY);
        window.dispatchEvent(new Event('force-check-images'));
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(() => requestAnimationFrame(restoreAndCheck), 150);
        }
      };

      requestAnimationFrame(restoreAndCheck);
    }

    const onScroll = () => sessionStorage.setItem(key, String(window.scrollY));
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', markInterrupted);
      window.removeEventListener('touchstart', markInterrupted);
    };
  }, [chapter, slug, chapterNumber]);

  // === TỰ ĐỘNG DỪNG AUTO SCROLL KHI NGƯỜI DÙNG SCROLL THỦ CÔNG ===
  const handleUserScroll = useCallback(() => {
    // Nếu là scroll trong 1 giây kể từ auto-scroll cuối cùng -> không dừng
    const timeSinceLastAutoScroll = Date.now() - lastAutoScrollTimeRef.current;
    if (isAutoScrolling && timeSinceLastAutoScroll > 1000) {
      setIsAutoScrolling(false);
    }
  }, [isAutoScrolling]);

  useEffect(() => {
    // Lắng nghe các sự kiện scroll, touch
    window.addEventListener('scroll', handleUserScroll, { passive: true });
    window.addEventListener('touchmove', handleUserScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    };
  }, [handleUserScroll]);

  // Reset Auto Scroll khi chuyển chương mới
  useEffect(() => {
    setIsAutoScrolling(false);
  }, [slug, chapterNumber]);

  // === CẬP NHẬT THANH TIẾN ĐỘ (tối ưu: update DOM trực tiếp qua ref, ===
  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress}%`;
      }
      ticking = false;
    };

    const handleScrollProgress = () => {
      // Gộp các sự kiện scroll dồn dập lại thành 1 lần đọc/tính mỗi frame
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    updateProgress(); // Cập nhật lần đầu

    return () => {
      window.removeEventListener('scroll', handleScrollProgress);
    };
  }, []);

  // Các hàm điều hướng (Giữ nguyên)
  const goToPreviousChapter = useCallback(() => {
    if (!isLoading && slug && displayChapterNumber > 1) {
      navigate(`/manga/${slug}/chapter/${displayChapterNumber - 1}`);
    }
  }, [isLoading, slug, displayChapterNumber, navigate]);

  const goToNextChapter = useCallback(() => {
    if (!isLoading && slug && totalChapters > 0 && displayChapterNumber < totalChapters) {
      navigate(`/manga/${slug}/chapter/${displayChapterNumber + 1}`);
    }
  }, [isLoading, slug, totalChapters, displayChapterNumber, navigate]);

  useKeyPress('ArrowLeft', goToPreviousChapter);
  useKeyPress('a', goToPreviousChapter);
  useKeyPress('ArrowRight', goToNextChapter);
  useKeyPress('d', goToNextChapter);

  // Effect fetch chapter content (Giữ nguyên logic của bạn)
  useEffect(() => {
    if (!slug || chapterNumber === undefined || isNaN(displayChapterNumber)) {
      toast.error("URL không hợp lệ.");
      return;
    }
    const fetchChapterContent = async () => {
      try {
        setIsLoading(true);
        setIsOfflineMode(false);
        const { chapter: currentChapterData } = await getChapterByNumberAPI(slug, chapterIndex);
        if (currentChapterData.images) currentChapterData.images.sort((a, b) => a.pageNumber - b.pageNumber);
        setChapter(currentChapterData);
        if (currentChapterData.manga && typeof currentChapterData.manga === 'object' && '_id' in currentChapterData.manga) {
          const mangaId = (currentChapterData.manga as { _id: string })._id;
          if (mangaId !== currentMangaId) setCurrentMangaId(mangaId);
        }
        const chapterToSave = {
          ...currentChapterData,
          number: currentChapterData.number + 1, // Ví dụ: database lưu 0, hiển thị là 1
          title: currentChapterData.title || `${currentChapterData.number + 1}`
        };

        const mangaInfo = currentChapterData.manga;

        // KIỂM TRA: API có trả về object Manga đầy đủ (có poster) không?
        if (mangaInfo && typeof mangaInfo === 'object' && 'poster' in mangaInfo) {
          // Case 1: Có full thông tin (thường là lần load đầu tiên hoặc API trả full)
          // -> Dùng hàm Add cũ để cập nhật mới toàn bộ
          addToHistory(mangaInfo, chapterToSave);
        } else {
          // Case 2: Chỉ có ID (khi chuyển chap) hoặc thiếu poster
          // -> Dùng hàm Update mới, chỉ thay đổi số chương
          const mId = typeof mangaInfo === 'string' ? mangaInfo : (mangaInfo as any)._id;
          if (mId) {
            updateHistoryChapter(mId, chapterToSave);
          }
        }
      } catch (error) {
        console.warn("API Error, attempting offline load...");
        try {
          const offlineData = await getChapterOffline(slug, chapterIndex);
          if (offlineData) {
            const offlineChapter: any = {
              ...offlineData,
              manga: { title: offlineData.mangaTitle, _id: 'offline-id' },
            };
            setChapter(offlineChapter);
            setIsOfflineMode(true);
            toast.success('Đang đọc chế độ Offline', { icon: '📡' });
          } else {
            throw new Error("Chưa tải chương này");
          }
        } catch (offlineError) {
          console.error("Offline load failed:", offlineError);
          toast.error("Mất kết nối và chưa tải chương này.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchChapterContent();
  }, [slug, chapterNumber]);

  // Effect fetch chapter list (Giữ nguyên)
  useEffect(() => {
    if (!currentMangaId || isOfflineMode) return;
    const fetchChapterList = async () => {
      try {
        const allChapters = await getChaptersByMangaIdAPI(currentMangaId);
        const sortedList = allChapters.sort((a, b) => a.number - b.number);
        setChapterList(sortedList);
      } catch (error) {
        console.error("Không tải được danh sách chương.");
      }
    };
    fetchChapterList();
  }, [currentMangaId, isOfflineMode]);

  const handleChapterSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = Number(e.target.value);
    navigate(`/manga/${slug}/chapter/${selectedIndex}`);
  }, [slug, navigate]);

  if (isLoading && !chapter) return <ChapterSkeleton />;

  if (!chapter) {
    return (
      <div className="text-center p-8">
        <h1 className="text-xl">Không tìm thấy chương.</h1>
        <Link to={`/manga/${slug}`} className="btn btn-primary mt-4">Quay lại</Link>
      </div>
    );
  }

  return (
    <div className="bg-base-300 text-base-content min-h-screen relative no-bounce">
      <ChapterHeader
        slug={slug!}
        displayChapterNumber={displayChapterNumber}
        chapterList={chapterList}
        isOfflineMode={isOfflineMode}
        onChapterSelect={handleChapterSelect}
        onTranslateToggle={() => setIsTranslateOpen((prev) => !prev)}
        currentChapterTitle={chapter.title}
      />

      <main className="flex flex-col items-center">
        {isOfflineMode && (
          <div className="w-full bg-warning text-warning-content text-center text-sm py-1 font-bold flex justify-center items-center gap-2">
            <FiWifiOff />
            Bạn đang xem bản lưu Offline
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <ChapterBreadcrumbs
            slug={slug!}
            chapterTitle={chapter.title}
            mangaTitle={typeof chapter.manga === 'object' && 'title' in chapter.manga ? (chapter.manga as { title: string }).title : undefined}
          />

          {/* Nút Báo cáo lỗi nhanh */}
          <div className="flex justify-center mt-2 mb-4">
            <ReportChapterModal
              mangaId={currentMangaId || ''}
              chapterId={chapter._id}
              chapterNumber={chapter.number + 1}
            />
          </div>
        </div>


        {chapter.images.map(image => (
          <ChapterImage
            key={image.pageNumber}
            src={image.url}
            alt={`Trang ${image.pageNumber}`}
          />
        ))}
      </main>

      <footer className="p-4 pb-20"> {/* Tăng padding bottom để không bị nút Floating che */}
        <div className="container mx-auto flex flex-col items-center gap-4">
          <ChapterNavigation
            mangaSlug={slug!}
            currentChapterDisplay={displayChapterNumber}
            totalChapters={totalChapters || 1}
          />
          <div className="flex gap-2 mt-2">
            <ShareChapterModal />
          </div>
        </div>
      </footer>

      {/* === 3. UI FLOATING CONTROL CHO AUTO SCROLL === */}
      <MangaReaderControls
        isAutoScrolling={isAutoScrolling}
        onTogglePlay={() => setIsAutoScrolling(!isAutoScrolling)}
        delay={scrollDelay}
        onDelayChange={setScrollDelay}
      />

      <TranslatePopup isOpen={isTranslateOpen} onClose={() => setIsTranslateOpen(false)} />

      {/* === THANH TIẾN ĐỘ CUỘN (update trực tiếp DOM qua ref, không qua state) === */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-base-200 z-50">
        <div
          ref={progressBarRef}
          className="h-full bg-primary"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
};

export default DetailChapter;