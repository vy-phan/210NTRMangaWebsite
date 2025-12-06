import { useState, useEffect } from 'react'; // 1. Import useState, useEffect
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/dateFomat';
import { useImageLoader } from '../../utils/useImageLoader';

interface MangaCardProps {
  manga: Manga;
}

const MangaCard = ({ manga }: MangaCardProps) => {
  const timeAgo = formatTimeAgo(manga.updatedAt || manga.createdAt);
  const { imageSrc, isLoading } = useImageLoader(manga.poster!, '/place-doro.webp');
  const [isContentHidden, setIsContentHidden] = useState(() => localStorage.getItem('isContentHidden') === 'true');
  useEffect(() => {
    const checkHiddenState = () => {
      setIsContentHidden(localStorage.getItem('isContentHidden') === 'true');
    };
    window.addEventListener('storage-local-change', checkHiddenState);
    return () => {
      window.removeEventListener('storage-local-change', checkHiddenState);
    };
  }, []);

  return (
    <Link
      to={`/manga/${manga.slug}`}
      className="card card-compact bg-base-100 shadow-md group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <figure className="relative aspect-[2/3] overflow-hidden">
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
        
        {/* Lớp phủ gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </figure>

      <div className="card-body p-3 space-y-1">
        <h3 className="card-title text-base leading-tight truncate" title={manga.title}>
          {manga.title}
        </h3>

        {timeAgo && (
          <p className="text-sm text-base-content/70">{timeAgo}</p>
        )}

        {manga.genres && manga.genres.length > 0 && (
          <div className="card-actions flex-wrap mt-2">
            {manga.genres.slice(0, 3).map(genre =>
              typeof genre !== 'string' && (
                <div key={genre._id} className="badge badge-outline text-xs">
                  {genre.name}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default MangaCard;