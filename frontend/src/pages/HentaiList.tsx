import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMultipleHentaisAPI } from '../api/hentaiApi';
import LazyImage from '../utils/LazyImage';
import { hentaiSlugs } from '../config/hentaiSlugs';

const HentaiList = () => {
  const [hentais, setHentais] = useState<Hentai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHentais = async () => {
      try {
        setIsLoading(true);
        const data = await getMultipleHentaisAPI(hentaiSlugs);
        setHentais(data);
      } catch (err) {
        setError('Failed to load hentai data');
        console.error('Error fetching hentais:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHentais();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="skeleton h-64 w-full rounded-lg"></div>
              <div className="skeleton h-4 w-full mt-2 rounded"></div>
              <div className="skeleton h-4 w-3/4 mt-1 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="alert alert-error max-w-md mx-auto">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-3">Danh Sách Hentai</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...hentais].reverse().map((hentai) => (
          <Link
            key={hentai.slug}
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
        ))}
      </div>
    </div>
  );
};

export default HentaiList;
