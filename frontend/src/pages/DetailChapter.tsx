import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getChapterByNumberAPI, getChaptersByMangaIdAPI } from '../api/chapterApi';
import { FiHome, FiWifiOff } from 'react-icons/fi';
import ChapterNavigation from '../components/manga/ChapterNavigation';
import { useKeyPress } from '../utils/useKeyPress';
import ChapterImage from '../components/manga/ChapterImage';
import ShareChapterModal from '../components/manga/ShareChapterModal';
import { getChapterOffline } from '../utils/offlineDB';
import AutoScrollControl from '../components/manga/AutoScrollControl';

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

  // === 1. STATE CHO AUTO SCROLL (PAGE DOWN MODE) ===
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollDelay, setScrollDelay] = useState(5); // Mặc định 5 giây nhảy 1 lần
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const displayChapterNumber = Number(chapterNumber);
  const chapterIndex = displayChapterNumber - 1;
  const totalChapters = chapterList.length;

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

  // Reset Auto Scroll khi chuyển chương mới
  useEffect(() => {
    setIsAutoScrolling(false);
  }, [slug, chapterNumber]);

  // Các hàm điều hướng (Giữ nguyên)
  const goToPreviousChapter = () => {
    if (!isLoading && slug && displayChapterNumber > 1) {
      navigate(`/manga/${slug}/chapter/${displayChapterNumber - 1}`);
    }
  };

  const goToNextChapter = () => {
    if (!isLoading && slug && totalChapters > 0 && displayChapterNumber < totalChapters) {
      navigate(`/manga/${slug}/chapter/${displayChapterNumber + 1}`);
    }
  };

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

  const handleChapterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = Number(e.target.value);
    navigate(`/manga/${slug}/chapter/${selectedIndex}`);
  };

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
    <div className="bg-base-300 text-base-content min-h-screen relative">
      <header className="sticky top-0 z-50 bg-base-300/80 backdrop-blur-sm shadow-lg p-2">
        <div className="container mx-auto flex justify-between items-center gap-2">
          <Link to={`/manga/${slug}`} className="btn btn-ghost" title="Về trang truyện">
            <FiHome />
          </Link>

          <select
            className="select select-bordered select-sm max-w-xs font-bold"
            value={displayChapterNumber}
            onChange={handleChapterSelect}
            disabled={isOfflineMode && chapterList.length === 0}
          >
            {chapterList.length > 0 ? (
              chapterList.map((chap, index) => (
                <option key={chap._id} value={index + 1}>
                  Chương {chap.title}
                </option>
              ))
            ) : (
              <option value={displayChapterNumber}>Chương {chapter.title}</option>
            )}
          </select>

          <ChapterNavigation
            mangaSlug={slug!}
            currentChapterDisplay={displayChapterNumber}
            totalChapters={totalChapters || 1}
            isHeader={true}
          />
        </div>
      </header>

      <main className="flex flex-col items-center">
        {isOfflineMode && (
          <div className="w-full bg-warning text-warning-content text-center text-sm py-1 font-bold flex justify-center items-center gap-2">
            <FiWifiOff />
            Bạn đang xem bản lưu Offline
          </div>
        )}

        <div className="w-full px-4 py-2 bg-base-200/50">
          <div className="text-sm breadcrumbs flex justify-center">
            <ul>
              <li><Link to="/">Trang chủ</Link></li>
              <li>
                {typeof chapter.manga === 'object' && 'title' in chapter.manga && (
                  <Link to={`/manga/${slug}`} className="font-semibold truncate max-w-[150px]">
                    {(chapter.manga as { title: string }).title}
                  </Link>
                )}
              </li>
              <li><span className="font-bold text-primary">Chương {chapter.title}</span></li>
            </ul>
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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AutoScrollControl
          isAutoScrolling={isAutoScrolling}
          onTogglePlay={() => setIsAutoScrolling(!isAutoScrolling)}
          delay={scrollDelay}
          onDelayChange={setScrollDelay}
        />
      </div>
    </div>
  );
};

export default DetailChapter;