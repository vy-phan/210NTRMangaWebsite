import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHentaiBySlugAPI, getHentaiEmbedUrl } from '../api/hentaiApi';
import LazyImage from '../utils/LazyImage';
import { FiClock, FiArrowLeft } from 'react-icons/fi';
import { hentaiSlugs } from '../config/hentaiSlugs';
import HentaiDetailSkeleton from '../components/common/HentaiDetailSkeleton';
import EpisodeThumbnail from '../components/hentai/EpisodeThumbnail';

const HentaiDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [hentai, setHentai] = useState<Hentai | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Không tìm thấy slug.');
      setIsLoading(false);
      return;
    }

    const fetchHentaiDetails = async () => {
      try {
        setIsLoading(true);
        const data = await getHentaiBySlugAPI(slug);
        setHentai(data);
      } catch (err) {
        setError('Không tìm thấy hentai hoặc đã có lỗi xảy ra.');
        console.error('Error fetching hentai details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHentaiDetails();
  }, [slug]);

  if (isLoading) return <HentaiDetailSkeleton />;

  if (error || !hentai) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-error">{error || 'Không tìm thấy dữ liệu.'}</h1>
        <Link to="/hentai" className="btn btn-primary mt-4">
          <FiArrowLeft className="mr-2" /> Quay về danh sách
        </Link>
      </div>
    );
  }

  const embedUrl = getHentaiEmbedUrl(hentai.slug, undefined, true);

  // Extract series name from slug (e.g., "imaria-1" -> "imaria")
  const getSeriesName = (slug: string) => {
    const match = slug.match(/^(.+)-\d+$/);
    return match ? match[1] : slug;
  };

  const currentSeries = getSeriesName(hentai.slug);
  
  // Filter slugs to find episodes of the same series
  const seriesEpisodes = hentaiSlugs
    .filter(slug => getSeriesName(slug) === currentSeries)
    .sort();

  return (
    <div className="bg-base-200 py-8">
      <div className="container mx-auto p-4 md:p-8">
        {/* Back Button */}
        <Link to="/hentai" className="btn btn-ghost btn-sm mb-4">
          <FiArrowLeft className="mr-2" /> Quay về danh sách
        </Link>

        {/* Video Player Section */}
        <section className="mb-8">
          <div className="video-container bg-black rounded-lg overflow-hidden shadow-2xl">
            <div className="video" style={{ width: '100%' }}>
              <iframe
                src={embedUrl}
                frameBorder="0"
                marginWidth={0}
                marginHeight={0}
                scrolling="no"
                allowFullScreen={true}
                className="w-full aspect-video"
                title={hentai.title}
              />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cover Image - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="aspect-[3/4] w-full max-w-xs rounded-lg shadow-2xl overflow-hidden mx-auto lg:mx-0 bg-base-300">
              <LazyImage
                src={hentai.coverImage}
                alt={hentai.title}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
            </div>
          </div>

          {/* Details */}
          <div className="col-span-1 lg:col-span-3">
            <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
              {hentai.title}
            </h1>

            <div className="flex items-center gap-2 text-base-content/70 mb-4">
              <FiClock className="w-4 h-4" />
              <span>Ngày phát hành: {new Date(hentai.releaseDate).toLocaleDateString('vi-VN')}</span>
            </div>

            <div className="flex items-center gap-2 text-base-content/70 mb-4">
              <FiClock className="w-4 h-4" />
              <span>Ngày tải lên: {new Date(hentai.uploadDate).toLocaleDateString('vi-VN')}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {hentai.genres.map((genre) => (
                <span
                  key={genre}
                  className="badge badge-primary badge-outline"
                >
                  {genre}
                </span>
              ))}
            </div>

            {hentai.series && (
              <div className="mb-6">
                <span className="text-base-content/70">Series: </span>
                <span className="font-semibold">{hentai.series}</span>
              </div>
            )}

            <div className="bg-base-100 p-6 rounded-box shadow-lg mb-6">
              <h2 className="text-xl font-bold mb-3">Mô tả</h2>
              <p className="text-base-content/90 whitespace-pre-wrap">
                {hentai.description || 'Không có mô tả.'}
              </p>
            </div>

            {/* Episode List */}
            {seriesEpisodes.length > 1 && (
              <div className="bg-base-100 p-6 rounded-box shadow-lg mb-6">
                <h2 className="text-xl font-bold mb-4">Danh sách tập</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {seriesEpisodes.map((episodeSlug) => (
                    <EpisodeThumbnail
                      key={episodeSlug}
                      episodeSlug={episodeSlug}
                      currentSlug={hentai.slug}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Storyboard Section */}
        {/* <section className="mt-8">
          <div className="bg-base-100 p-6 rounded-box shadow-lg">
            <h2 className="text-xl font-bold mb-4">Storyboard</h2>
            <div className="w-full overflow-hidden rounded-lg">
              <LazyImage
                src={getHentaiStoryboardUrl(hentai.slug)}
                alt="Storyboard"
                className="w-full h-auto"
                containerClassName="w-full"
              />
            </div>
          </div>
        </section> */}
      </div>

      <style>{`
        .video-container {
          position: relative;
          width: 100%;
          padding-bottom: calc(56.25% + 40px);
          height: 0;
        }
        .video-container iframe {
          position: absolute;
          width: 100%;
          height: 100%;
          left: 0;
          top: 0;
        }
      `}</style>
    </div>
  );
};

export default HentaiDetail;
