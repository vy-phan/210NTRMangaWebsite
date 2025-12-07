import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getChapterByNumberAPI, getChaptersByMangaIdAPI } from '../api/chapterApi';
import { FiHome } from 'react-icons/fi';
import ChapterNavigation from '../components/manga/ChapterNavigation';
import { useKeyPress } from '../utils/useKeyPress';
import ChapterImage from '../components/manga/ChapterImage';

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

  // === EFFECT 1: Tải Nội dung Chương (Chạy khi đổi Chapter) ===
  useEffect(() => {
    if (!slug || chapterNumber === undefined || isNaN(displayChapterNumber)) {
      toast.error("URL không hợp lệ.");
      return;
    }

    const fetchChapterContent = async () => {
      try {
        setIsLoading(true);

        // 1. Lấy nội dung chương hiện tại
        const { chapter: currentChapterData } = await getChapterByNumberAPI(slug, chapterIndex);
        
        // Sắp xếp ảnh
        if (currentChapterData.images) {
            currentChapterData.images.sort((a, b) => a.pageNumber - b.pageNumber);
        }
        setChapter(currentChapterData);

        // 2. Kiểm tra và cập nhật ID truyện
        // Logic này để kích hoạt Effect 2 bên dưới chạy (chỉ 1 lần)
        if (currentChapterData.manga && typeof currentChapterData.manga === 'object' && '_id' in currentChapterData.manga) {
            const mangaId = (currentChapterData.manga as { _id: string })._id;
            
            // Chỉ set nếu ID khác với hiện tại (để tránh re-render không cần thiết)
            if (mangaId !== currentMangaId) {
                setCurrentMangaId(mangaId);
            }
        }

      } catch (error) {
        console.error(error);
        toast.error("Lỗi tải dữ liệu.");
      } finally {
        setIsLoading(false);
      }
    };

    window.scrollTo(0, 0);
    fetchChapterContent();
    
    // Dependencies: Chỉ chạy khi slug hoặc số chương thay đổi
  }, [slug, chapterNumber]); 


  // === EFFECT 2: Tải Danh sách List (Chỉ chạy 1 lần khi currentMangaId thay đổi) ===
  useEffect(() => {
    if (!currentMangaId) return;

    const fetchChapterList = async () => {
        try {
            const allChapters = await getChaptersByMangaIdAPI(currentMangaId);
            const sortedList = allChapters.sort((a, b) => a.number - b.number);    
            setChapterList(sortedList);
        } catch (error) {
            console.error("Lỗi tải danh sách chương:", error);
        }
    };

    fetchChapterList();
  }, [currentMangaId]);


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
          <select
            className="select select-bordered select-sm max-w-xs font-bold"
            value={displayChapterNumber}
            onChange={handleChapterSelect}
          >
            {/* Nếu list đã load xong thì hiển thị list, nếu chưa thì hiển thị tạm chương hiện tại */}
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
            totalChapters={totalChapters || 1} // Fallback là 1 để tránh lỗi hiển thị nếu list chưa về
            isHeader={true}
          />
        </div>
      </header>

      <main className="flex flex-col items-center">
        {/* Tiêu đề chương */}
        <div className="text-center py-4 text-base-content/50 text-sm">
           {typeof chapter.manga === 'object' && 'title' in chapter.manga ? (chapter.manga as { title: string }).title : ''} - {chapter.title}
        </div>

        {chapter.images.map(image => (
          <ChapterImage
            key={image.pageNumber}
            src={image.url}
            alt={`Trang ${image.pageNumber}`}
          />
        ))}
      </main>

      <footer className="p-4">
        <div className="container mx-auto flex justify-center">
          <ChapterNavigation
            mangaSlug={slug!}
            currentChapterDisplay={displayChapterNumber}
            totalChapters={totalChapters || 1}
          />
        </div>
      </footer>
    </div>
  );
};

export default DetailChapter;