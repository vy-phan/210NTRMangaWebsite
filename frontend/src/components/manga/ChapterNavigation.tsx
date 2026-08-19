import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiArrowUp } from 'react-icons/fi';

interface ChapterNavigationProps {
  mangaSlug: string;
  currentChapterDisplay: number; // Số chương hiển thị (bắt đầu từ 1)
  totalChapters: number;
  isHeader?: boolean;
}

const ChapterNavigation = ({ mangaSlug, currentChapterDisplay, totalChapters, isHeader = false }: ChapterNavigationProps) => {
  const hasPrevious = currentChapterDisplay > 1;
  const hasNext = currentChapterDisplay < totalChapters;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Cuộn mượt mà
    });
  };

  return (
    <div className="join">
      {/* Nút Chương Trước */}
      {hasPrevious ? (
        <Link to={`/manga/${mangaSlug}/chapter/${currentChapterDisplay - 1}`} className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`}>
          <FiArrowLeft />
          {isHeader && <span className="hidden md:inline">Trước</span>}
          {!isHeader && <span>Chương trước</span>}
        </Link>
      ) : (
        <button className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`} disabled>
          <FiArrowLeft />
          {isHeader && <span className="hidden md:inline">Trước</span>}
          {!isHeader && <span>Chương trước</span>}
        </button>
      )}

      {/* Nút Chương Sau */}
      {hasNext ? (
        <Link to={`/manga/${mangaSlug}/chapter/${currentChapterDisplay + 1}`} className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`}>
          {isHeader && <span className="hidden md:inline">Sau</span>}
          {!isHeader && <span>Chương sau</span>}
          <FiArrowRight />
        </Link>
      ) : (
        <button className={`join-item btn ${isHeader ? 'btn-ghost' : ''}`} disabled>
          {isHeader && <span className="hidden md:inline">Sau</span>}
          {!isHeader && <span>Chương sau</span>}
          <FiArrowRight />
        </button>
      )}

      {!isHeader && (
        <button 
          onClick={scrollToTop}
          className="join-item btn btn-primary" // Dùng màu primary để nổi bật
          aria-label="Cuộn lên đầu trang"
        >
          <FiArrowUp />
        </button>
      )}
    </div>
  );
};

export default React.memo(ChapterNavigation);