import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface ChapterNavigationProps {
  mangaSlug: string;
  currentChapterDisplay: number; // Số chương hiển thị (bắt đầu từ 1)
  totalChapters: number;
  isHeader?: boolean;
}

const ChapterNavigation = ({ mangaSlug, currentChapterDisplay, totalChapters, isHeader = false }: ChapterNavigationProps) => {
  const hasPrevious = currentChapterDisplay > 1;
  const hasNext = currentChapterDisplay < totalChapters;

  return (
    <div className="join">
      {/* Nút Chương Trước */}
      {hasPrevious ? (
        <Link to={`/manga/${mangaSlug}/chapter/${currentChapterDisplay - 1}`} className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`}>
          <FiArrowLeft /> {isHeader && <span className="hidden md:inline">Trước</span>}
        </Link>
      ) : (
        <button className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`} disabled>
          <FiArrowLeft /> {isHeader && <span className="hidden md:inline">Trước</span>}
        </button>
      )}

      {/* Nút Chương Sau */}
      {hasNext ? (
        <Link to={`/manga/${mangaSlug}/chapter/${currentChapterDisplay + 1}`} className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`}>
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