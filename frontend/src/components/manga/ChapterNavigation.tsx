import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface ChapterNavigationProps {
  mangaSlug: string;
  currentChapter: number;
  totalChapters: number;
  isHeader?: boolean; // prop để phân biệt style cho header
}

const ChapterNavigation = ({ mangaSlug, currentChapter, totalChapters, isHeader = false }: ChapterNavigationProps) => {
  const hasPrevious = currentChapter > 0; // Giả sử chương 0 là chương đầu tiên
  const hasNext = currentChapter < totalChapters - 1; // Logic cần kiểm tra tổng số chương

  return (
    <div className="join">
      {/* Nút Chương Trước */}
      {hasPrevious ? (
        <Link to={`/manga/${mangaSlug}/chapter/${currentChapter - 1}`} className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`}>
          <FiArrowLeft /> {isHeader && <span className="hidden md:inline">Trước</span>}
        </Link>
      ) : (
        <button className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`} disabled>
          <FiArrowLeft /> {isHeader && <span className="hidden md:inline">Trước</span>}
        </button>
      )}

      {/* Nút Chương Sau */}
      {hasNext ? (
        <Link to={`/manga/${mangaSlug}/chapter/${currentChapter + 1}`} className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`}>
          {isHeader && <span className="hidden md:inline">Sau</span>} <FiArrowRight />
        </Link>
      ) : (
        <button className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`} disabled>
          {isHeader && <span className="hidden md:inline">Sau</span>} <FiArrowRight />
        </button>
      )}
    </div>
  );
};

export default ChapterNavigation;