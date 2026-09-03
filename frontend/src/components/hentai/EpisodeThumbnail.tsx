import { Link } from 'react-router-dom';
import LazyImage from '../../utils/LazyImage';
import { getHentaiThumbnailUrl } from '../../api/hentaiApi';

interface EpisodeThumbnailProps {
  episodeSlug: string;
  currentSlug: string;
}

const EpisodeThumbnail = ({ episodeSlug, currentSlug }: EpisodeThumbnailProps) => {
  const episodeNum = episodeSlug.split('-').pop();
  const isCurrentEpisode = episodeSlug === currentSlug;

  return (
    <Link
      to={`/hentai/${episodeSlug}`}
      className="group relative"
    >
      <div className={`aspect-video rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
        isCurrentEpisode 
          ? 'ring-4 ring-primary' 
          : 'hover:scale-105 hover:shadow-xl'
      }`}>
        <LazyImage
          src={getHentaiThumbnailUrl(episodeSlug)}
          alt={`Tập ${episodeNum}`}
          className="w-full h-full object-cover"
          containerClassName="w-full h-full"
        />
        <div className={`absolute inset-0 flex items-center justify-center ${
          isCurrentEpisode 
            ? 'bg-primary/30' 
            : 'bg-black/0 group-hover:bg-black/30'
        } transition-all duration-300`}>
          <span className={`text-white font-bold text-lg ${
            isCurrentEpisode ? 'text-white' : 'opacity-0 group-hover:opacity-100'
          } transition-opacity duration-300`}>
            Tập {episodeNum}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EpisodeThumbnail;
