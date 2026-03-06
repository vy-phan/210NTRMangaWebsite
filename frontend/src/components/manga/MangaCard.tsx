import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/dateFomat';
import { useImageLoader } from '../../utils/useImageLoader';
import { useHistoryStore } from '../../store/useHistoryStore';

interface MangaCardProps {
  manga: Manga;
}

const MangaCard = ({ manga }: MangaCardProps) => {
  const latestChapTime = manga.latestChapters?.[0]?.createdAt;
  const displayTime = formatTimeAgo(latestChapTime || manga.updatedAt || manga.createdAt);

  const { imageSrc, isLoading } = useImageLoader(manga.poster!, '/place-doro.webp');
  const [isContentHidden, setIsContentHidden] = useState(() => localStorage.getItem('isContentHidden') === 'true');

  const { addToHistory, history } = useHistoryStore();

  useEffect(() => {
    const checkHiddenState = () => {
      setIsContentHidden(localStorage.getItem('isContentHidden') === 'true');
    };
    window.addEventListener('storage-local-change', checkHiddenState);
    return () => {
      window.removeEventListener('storage-local-change', checkHiddenState);
    };
  }, []);

  const isNewChapter = (createdAt?: string | Date) => {
    if (!createdAt) return false;
    const diff = new Date().getTime() - new Date(createdAt).getTime();
    return diff > 0 && diff < 24 * 60 * 60 * 1000; // Dưới 24h và không phải tương lai
  };

  const handleReadChapter = (chap: any) => {
    if (!manga) return;
    const historyChapter = {
      ...chap,
      number: chap.number + 1,
      title: chap.title || `${chap.number + 1}`
    };
    addToHistory(manga, historyChapter);
  };

  const hasLatestChapters = Array.isArray(manga.latestChapters) && manga.latestChapters.length > 0;

  return (
    <div className="card card-compact bg-base-100 shadow-md group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
      <Link to={`/manga/${manga.slug}`} className="relative aspect-[2/3] overflow-hidden rounded-t-xl block">
        <img
          src={imageSrc}
          alt={manga.title}
          className={`
            w-full h-full object-cover 
            transition-all duration-500 
            ${isContentHidden ? 'blur-lg scale-100' : (isLoading ? 'blur-md scale-110' : 'blur-0 scale-100')}
            group-hover:scale-105
          `}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="card-body p-3 space-y-1">
        <h3 className="card-title text-base leading-tight truncate block" title={manga.title}>
          <Link to={`/manga/${manga.slug}`} className="hover:text-primary transition-colors">
            {manga.title}
          </Link>
        </h3>

        {hasLatestChapters ? (
          <div className="flex flex-col gap-1.5 mt-1">
            {manga.latestChapters!.slice(0, 2).map((chap) => {
              const displayNum = chap.number + 1;
              const isOneshot = manga.latestChapters!.length === 1 && chap.title === "1";

              return (
                <div key={chap._id} className="flex justify-between items-center text-xs group/chap">
                  <div className="flex items-center gap-1.5 flex-grow min-w-0 pr-1">
                    <Link
                      to={`/manga/${manga.slug}/chapter/${displayNum}`}
                      className="
                        truncate px-2 py-1 rounded-md transition-colors text-[11px]
                        bg-primary/10 text-primary font-bold hover:bg-primary/20
                      "
                      onClick={() => handleReadChapter(chap)}
                    >
                      {isOneshot ? 'Oneshot' : `Chương ${chap.title}`}
                    </Link>
                    {isNewChapter(chap.createdAt) && (
                      <span className="bg-red-500 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shrink-0 shadow-sm animate-pulse-subtle">
                        Mới
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-base-content/40 italic shrink-0">
                    {formatTimeAgo(chap.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          //  Nếu API không trả về chapters, hiển thị như cũ (Time + Genres)
          <>
            {displayTime && (
              <p className="text-sm text-base-content/70 flex items-center gap-1">
                {displayTime}
              </p>
            )}

            {manga.genres && manga.genres.length > 0 && (
              <div className="card-actions flex-wrap mt-2">
                {manga.genres.slice(0, 3).map(genre =>
                  typeof genre !== 'string' && (
                    <Link
                      key={genre._id}
                      to={`/genre/${genre.slug}`}
                      className="badge badge-outline text-xs hover:bg-info hover:text-white transition-colors"
                    >
                      {genre.name}
                    </Link>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MangaCard;