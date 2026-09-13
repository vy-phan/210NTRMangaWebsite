import { Link } from 'react-router-dom';
import LazyImage from '../../utils/LazyImage';
import { getHentaiThumbnailUrl } from '../../api/hentaiApi';

interface EpisodeListItemProps {
  episodeSlug: string;
  currentSlug: string;
  hentaiTitle: string;
}

const EpisodeListItem = ({ episodeSlug, currentSlug, hentaiTitle }: EpisodeListItemProps) => {
  const episodeNum = episodeSlug.split('-').pop();
  const isCurrentEpisode = episodeSlug === currentSlug;

  return (
    <Link
      to={`/hentai/${episodeSlug}`}
      className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
        isCurrentEpisode 
          ? 'bg-primary/20 ring-2 ring-primary' 
          : 'bg-base-200 hover:bg-base-300'
      }`}
    >
      <div className="flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden shadow-md">
        <LazyImage
          src={getHentaiThumbnailUrl(episodeSlug)}
          alt={`Tập ${episodeNum}`}
          className="w-full h-full object-cover"
          containerClassName="w-full h-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base-content line-clamp-1">
          {hentaiTitle.replace(/\s*\d+$/, '')}
        </h4>
        <p className={`text-sm ${isCurrentEpisode ? 'text-primary font-bold' : 'text-base-content/70'}`}>
          Tập {episodeNum}
        </p>
      </div>
    </Link>
  );
};

export default EpisodeListItem;
