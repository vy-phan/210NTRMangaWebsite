import { useEffect, useState } from 'react';
import { getMultipleHentaisAPI } from '../api/hentaiApi';
import { hentaiSlugs } from '../config/hentaiSlugs';
import HentaiCard from '../components/hentai/HentaiCard';

const HentaiList = () => {
  const [hentais, setHentais] = useState<Hentai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHentais = async () => {
      try {
        setIsLoading(true);
        
        // Group slugs by series name and get only episode 1 of each series
        const getSeriesName = (slug: string) => {
          const match = slug.match(/^(.+)-\d+$/);
          return match ? match[1] : slug;
        };

        const seriesMap = new Map<string, string>();
        hentaiSlugs.forEach(slug => {
          const seriesName = getSeriesName(slug);
          if (!seriesMap.has(seriesName)) {
            seriesMap.set(seriesName, slug);
          }
        });

        const representativeSlugs = Array.from(seriesMap.values());
        const data = await getMultipleHentaisAPI(representativeSlugs);
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
          <HentaiCard key={hentai.slug} hentai={hentai} />
        ))}
      </div>
    </div>
  );
};

export default HentaiList;
