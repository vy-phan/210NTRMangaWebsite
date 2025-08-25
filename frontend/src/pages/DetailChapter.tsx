import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getChapterByNumberAPI } from '../api/chapterApi';
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
  const [totalChapters, setTotalChapters] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const num = Number(chapterNumber);

  const goToPreviousChapter = () => {
    // Thêm điều kiện kiểm tra để không điều hướng khi đang loading hoặc không có slug
    if (!isLoading && slug && num > 0) {
      navigate(`/manga/${slug}/chapter/${num - 1}`);
    }
  };

  const goToNextChapter = () => {
    if (!isLoading && slug && num < totalChapters - 1) {
      navigate(`/manga/${slug}/chapter/${num + 1}`);
    }
  };

  // === 3. GỌI CUSTOM HOOK `useKeyPress` NGAY SAU ĐÓ ===
  useKeyPress('ArrowLeft', goToPreviousChapter);
  useKeyPress('a', goToPreviousChapter);
  useKeyPress('ArrowRight', goToNextChapter);
  useKeyPress('d', goToNextChapter);

  useEffect(() => {
    if (!slug || chapterNumber === undefined) {
      toast.error("URL không hợp lệ.");
      setIsLoading(false);
      return;
    }

    if (isNaN(num)) {
      toast.error("Số chương không hợp lệ.");
      setIsLoading(false);
      return;
    }


    const fetchChapter = async () => {
      try {
        setIsLoading(true);
        const { chapter: data, totalChapters: total } = await getChapterByNumberAPI(slug, num);
        // Sắp xếp lại ảnh theo pageNumber để đảm bảo thứ tự
        data.images.sort((a, b) => a.pageNumber - b.pageNumber);
        setChapter(data);
        setTotalChapters(total);
      } catch (error) {
        toast.error("Không thể tải dữ liệu chương này.");
        navigate(`/manga/${slug}`); // Chuyển về trang chi tiết truyện nếu lỗi
      } finally {
        setIsLoading(false);
      }
    };

    window.scrollTo(0, 0);
    fetchChapter();
  }, [slug, chapterNumber, navigate]);


  const handleChapterSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChapter = e.target.value;
    navigate(`/manga/${slug}/chapter/${selectedChapter}`);
  };

  if (isLoading) return <ChapterSkeleton />;

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
      {/* Thanh điều hướng cố định */}
      <header className="sticky top-0 z-50 bg-base-300/80 backdrop-blur-sm shadow-lg p-2">
        <div className="container mx-auto flex justify-between items-center gap-2">
          <Link to={`/manga/${slug}`} className="btn btn-ghost">
            <FiHome />
          </Link>

          {/* === DROPDOWN CHỌN CHƯƠNG === */}
          <select
            className="select select-bordered select-sm max-w-xs"
            value={num}
            onChange={handleChapterSelect}
          >
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map(chapNum => (
              <option key={chapNum} value={chapNum}>
                Chương {chapNum}
              </option>
            ))}
          </select>

          {/* === SỬ DỤNG COMPONENT ĐIỀU HƯỚNG MỚI === */}
          <ChapterNavigation
            mangaSlug={slug!}
            currentChapter={num}
            totalChapters={totalChapters}
            isHeader={true}
          />
        </div>
      </header>

      {/* Khu vực hiển thị ảnh truyện */}
      <main className="flex flex-col items-center">
        {chapter.images.map(image => (
          // 2. Thay thế <img> bằng component <ChapterImage />
          <ChapterImage
            key={image.pageNumber}
            src={image.url}
            alt={`Trang ${image.pageNumber}`}
          />
        ))}
      </main>

      {/* (Tùy chọn) Thêm lại thanh điều hướng ở cuối trang */}
      <footer className="p-4">
        <div className="container mx-auto flex justify-center">
          {/* === TÁI SỬ DỤNG COMPONENT ĐIỀU HƯỚNG === */}
          <ChapterNavigation
            mangaSlug={slug!}
            currentChapter={num}
            totalChapters={totalChapters}
          />
        </div>
      </footer>
    </div>
  );
};

export default DetailChapter;