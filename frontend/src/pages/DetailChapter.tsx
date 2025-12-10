import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getChapterByNumberAPI, getChaptersByMangaIdAPI } from '../api/chapterApi';
import { FiHome, FiWifiOff } from 'react-icons/fi'; // Import thêm icon WifiOff
import ChapterNavigation from '../components/manga/ChapterNavigation';
import { useKeyPress } from '../utils/useKeyPress';
import ChapterImage from '../components/manga/ChapterImage';
import ShareChapterModal from '../components/manga/ShareChapterModal';
import { getChapterOffline } from '../utils/offlineDB';

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

  // 2. THÊM STATE ĐỂ NHẬN BIẾT ĐANG OFFLINE
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const displayChapterNumber = Number(chapterNumber);
  const chapterIndex = displayChapterNumber - 1;
  const totalChapters = chapterList.length;

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

  // === EFFECT 1: Tải Nội dung Chương (ĐÃ SỬA LOGIC FALLBACK) ===
  useEffect(() => {
    if (!slug || chapterNumber === undefined || isNaN(displayChapterNumber)) {
      toast.error("URL không hợp lệ.");
      return;
    }

    const fetchChapterContent = async () => {
      try {
        setIsLoading(true);
        setIsOfflineMode(false); // Mặc định thử Online trước

        // --- BƯỚC 1: THỬ GỌI API ONLINE ---
        const { chapter: currentChapterData } = await getChapterByNumberAPI(slug, chapterIndex);

        if (currentChapterData.images) {
          currentChapterData.images.sort((a, b) => a.pageNumber - b.pageNumber);
        }
        setChapter(currentChapterData);

        if (currentChapterData.manga && typeof currentChapterData.manga === 'object' && '_id' in currentChapterData.manga) {
          const mangaId = (currentChapterData.manga as { _id: string })._id;
          if (mangaId !== currentMangaId) {
            setCurrentMangaId(mangaId);
          }
        }

      } catch (error) {
        // --- BƯỚC 2: NẾU API LỖI (MẤT MẠNG) -> GỌI OFFLINE DB ---
        console.warn("API Error, attempting offline load...");

        try {
          const offlineData = await getChapterOffline(slug, chapterIndex);

          if (offlineData) {
            const offlineChapter: any = {
              ...offlineData,
              manga: { title: offlineData.mangaTitle, _id: 'offline-id' },
            };

            setChapter(offlineChapter);
            setIsOfflineMode(true); // Bật chế độ offline
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


  // === EFFECT 2: Tải Danh sách (GIỮ NGUYÊN) ===
  // Lưu ý: Khi offline, cái này sẽ lỗi network, nhưng không sao,
  // chúng ta đã chặn lỗi ở catch bên dưới rồi.
  useEffect(() => {
    if (!currentMangaId || isOfflineMode) return;

    const fetchChapterList = async () => {
      try {
        const allChapters = await getChaptersByMangaIdAPI(currentMangaId);
        const sortedList = allChapters.sort((a, b) => a.number - b.number);
        setChapterList(sortedList);
      } catch (error) {
        console.error("Không tải được danh sách chương (có thể do offline).");
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
    <div className="bg-base-300 text-base-content min-h-screen">
      <header className="sticky top-0 z-50 bg-base-300/80 backdrop-blur-sm shadow-lg p-2">
        <div className="container mx-auto flex justify-between items-center gap-2">
          <Link to={`/manga/${slug}`} className="btn btn-ghost" title="Về trang truyện">
            <FiHome />
          </Link>

          {/* === DROPDOWN === */}
          {/* Khi Offline, chapterList có thể rỗng, dropdown sẽ chỉ hiện chương hiện tại */}
          <select
            className="select select-bordered select-sm max-w-xs font-bold"
            value={displayChapterNumber}
            onChange={handleChapterSelect}
            disabled={isOfflineMode && chapterList.length === 0} // Disable nếu offline mà ko có list
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
        {/* THANH THÔNG BÁO OFFLINE */}
        {isOfflineMode && (
          <div className="w-full bg-warning text-warning-content text-center text-sm py-1 font-bold flex justify-center items-center gap-2">
            <FiWifiOff />
            Bạn đang xem bản lưu Offline
          </div>
        )}

        {/* === BREADCRUMBS (Đường dẫn điều hướng) === */}
        <div className="w-full px-4 py-2 bg-base-200/50">
          <div className="text-sm breadcrumbs flex justify-center">
            <ul>
              {/* 1. Trang chủ */}
              <li>
                <Link to="/" className="hover:text-primary transition-colors text-base-content/70">
                  Trang chủ
                </Link>
              </li>

              {/* 2. Tên Truyện (Click để quay lại trang chi tiết) */}
              <li>
                {typeof chapter.manga === 'object' && 'title' in chapter.manga && (
                  <Link
                    to={`/manga/${slug}`}
                    className="font-semibold hover:text-primary transition-colors max-w-[150px] sm:max-w-xs truncate"
                    title={(chapter.manga as { title: string }).title}
                  >
                    {(chapter.manga as { title: string }).title}
                  </Link>
                )}
              </li>

              {/* 3. Tên Chương hiện tại (Màu sáng hơn để nổi bật) */}
              <li>
                <span className="font-bold text-primary truncate max-w-[120px] sm:max-w-none">
                  Chương {chapter.title}
                </span>
              </li>
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

      <footer className="p-4 pb-8">
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
    </div>
  );
};

export default DetailChapter;