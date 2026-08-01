import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useImageLoader } from '../../utils/useImageLoader';
import { FiChevronRight } from 'react-icons/fi';
import MangaStatusBadge from '../common/MangaStatusBadge';
import { useContentHidden } from '../../context/ContentHiddenContext';

// Component Card Nâng cấp
const MiniMangaCard = ({ manga }: { manga: Manga }) => {
    const { imageSrc } = useImageLoader(manga.poster!, '/place-doro.webp');
    const { isContentHidden } = useContentHidden();

    return (
        <Link
            to={`/manga/${manga.slug}`}
            className="block group w-36 md:w-full flex-shrink-0 relative transition-transform duration-300 active:scale-95"
        >
            <figure className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-lg border border-base-content/5">
                {/* Ảnh chính - Áp dụng class blur */}
                <img
                    src={imageSrc}
                    alt={manga.title}
                    className={`
                        w-full h-full object-cover
                        transition-all duration-500
                        ${isContentHidden ? 'blur-xl scale-110' : 'scale-100'}
                        group-hover:scale-110
                    `}
                    loading="lazy"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badge Trạng thái */}
                <div className="absolute top-2 right-2">
                    <div className="bg-base-100/80 backdrop-blur-sm rounded-full shadow-sm">
                        <MangaStatusBadge status={manga.status} />
                    </div>
                </div>
            </figure>

            <div className="mt-2 px-1">
                <h3
                    className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors"
                    title={manga.title}
                >
                    {manga.title}
                </h3>
            </div>
        </Link>
    );
};

const MemoizedMiniMangaCard = memo(MiniMangaCard);

interface RelatedMangaListProps {
    mangas: Manga[];
}

const RelatedMangaList = ({ mangas }: RelatedMangaListProps) => {
    const displayMangas = mangas.slice(0, 12);

    return (
        <section className="mt-12 relative">
            <div className="flex items-center justify-between mb-4 md:mb-6 pl-2 border-l-4 border-secondary">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <span>Có thể bạn cũng thích</span>
                </h2>
                <Link to="/search" className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100 hover:text-primary transition-opacity">
                    Xem thêm <FiChevronRight />
                </Link>
            </div>

            {/* Container */}
            <div className="relative group/container">

                {/* LIST CARD */}
                <div className="
                    flex overflow-x-auto gap-4 pb-6 pt-1 px-1 snap-x snap-mandatory 
                    scrollbar-hide scroll-smooth
                    md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:pb-0
                ">
                    {displayMangas.map(manga => (
                        <div key={manga._id} className="snap-start">
                            <MemoizedMiniMangaCard manga={manga} />
                        </div>
                    ))}

                    <div className="w-2 md:hidden flex-shrink-0"></div>
                </div>

                <div className="
                    absolute inset-y-0 right-0 w-12 
                    bg-gradient-to-l from-base-200 to-transparent 
                    pointer-events-none md:hidden
                    opacity-100 transition-opacity duration-300
                " />

            </div>
        </section>
    );
};

export default memo(RelatedMangaList);