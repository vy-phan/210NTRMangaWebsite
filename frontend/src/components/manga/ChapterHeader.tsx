import { Link } from 'react-router-dom';
import { FiHome, FiGlobe } from 'react-icons/fi';
import ChapterNavigation from './ChapterNavigation';

interface ChapterHeaderProps {
  slug: string;
  displayChapterNumber: number;
  chapterList: Chapter[];
  isOfflineMode: boolean;
  onChapterSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTranslateToggle: () => void;
  currentChapterTitle?: string;
}

const ChapterHeader = ({
  slug,
  displayChapterNumber,
  chapterList,
  isOfflineMode,
  onChapterSelect,
  onTranslateToggle,
  currentChapterTitle
}: ChapterHeaderProps) => {
  const totalChapters = chapterList.length;

  return (
    <header className="sticky top-0 z-50 bg-base-300/80 backdrop-blur-sm shadow-lg p-2">
      <div className="container mx-auto flex justify-between items-center gap-2">
        <div className="flex gap-1">
          <Link to="/" className="btn btn-ghost" title="Về trang chủ">
            <FiHome />
          </Link>
          <button
            onClick={onTranslateToggle}
            className="btn btn-ghost"
            title="Tra từ Anh - Việt"
            aria-label="Tra từ Anh - Việt"
          >
            <FiGlobe />
          </button>
        </div>

        <select
          className="select select-bordered select-sm w-32 sm:max-w-xs font-bold truncate"
          style={{ textOverflow: 'ellipsis' }}
          value={displayChapterNumber}
          onChange={onChapterSelect}
          disabled={isOfflineMode && chapterList.length === 0}
        >
          {chapterList.length > 0 ? (
            chapterList.map((chap) => (
              <option key={chap._id} value={chap.number + 1}>
                Chương {chap.title}
              </option>
            ))
          ) : (
            <option value={displayChapterNumber}>Chương {currentChapterTitle || displayChapterNumber}</option>
          )}
        </select>

        <ChapterNavigation
          mangaSlug={slug}
          currentChapterDisplay={displayChapterNumber}
          totalChapters={totalChapters || 1}
          isHeader={true}
        />
      </div>
    </header>
  );
};

export default ChapterHeader;
