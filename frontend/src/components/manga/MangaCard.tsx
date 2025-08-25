import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/dateFomat';
import { useImageLoader } from '../../utils/useImageLoader';

interface MangaCardProps {
  manga: Manga;
}

const MangaCard = ({ manga }: MangaCardProps) => {
  const timeAgo = formatTimeAgo(manga.updatedAt || manga.createdAt);

  const { imageSrc, isLoading } = useImageLoader(manga.poster!, '/place-doro.webp');

  return (
    // 1. Sử dụng semantic color `bg-base-100` cho nền card.
    //    Nó sẽ là màu trắng/sáng ở light mode và màu tối ở dark mode.
    //    Thêm `shadow-md` và `hover:shadow-xl` để card nổi bật.
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
            ${isLoading ? 'blur-md scale-110' : 'blur-0 scale-100'}
            group-hover:scale-105
          `}
          referrerPolicy="no-referrer"
        />
        {/* Lớp phủ sẽ luôn hiệu quả trên cả 2 theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </figure>

      {/* 2. Sử dụng `card-body` để có padding và layout nhất quán */}
      <div className="card-body p-3 space-y-1">
        {/* 3. Dùng `card-title` để đảm bảo font size và weight nhất quán */}
        <h3 className="card-title text-base leading-tight truncate" title={manga.title}>
          {manga.title}
        </h3>

        {/* 4. `text-base-content/70` sẽ tự động đổi màu chữ phụ thuộc vào theme */}
        {timeAgo && (
          <p className="text-sm text-base-content/70">{timeAgo}</p>
        )}

        {/* 5. `badge-outline` cũng tự động đổi màu viền */}
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