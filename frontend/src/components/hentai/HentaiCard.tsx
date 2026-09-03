import { Link } from 'react-router-dom';
import LazyImage from '../../utils/LazyImage';

interface HentaiCardProps {
  hentai: Hentai;
}

const HentaiCard = ({ hentai }: HentaiCardProps) => {
  return (
    <Link
      to={`/hentai/${hentai.slug}`}
      className="group"
    >
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full">
        <figure className="relative aspect-[3/4] overflow-hidden">
          <LazyImage
            src={hentai.coverImage}
            alt={hentai.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            containerClassName="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </figure>
        
        <div className="card-body p-4">
          <h3 className="card-title text-base font-semibold line-clamp-2 min-h-[3rem]">
            {hentai.title}
          </h3>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {hentai.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="badge badge-xs badge-outline hover:badge-primary cursor-pointer"
              >
                {genre}
              </span>
            ))}
            {hentai.genres.length > 3 && (
              <span className="badge badge-xs badge-ghost">
                +{hentai.genres.length - 3}
              </span>
            )}
          </div>

          <div className="text-xs text-base-content/60 mt-2">
            {new Date(hentai.uploadDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HentaiCard;
