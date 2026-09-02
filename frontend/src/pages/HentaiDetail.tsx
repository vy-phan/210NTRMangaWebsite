import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getHentaiBySlugAPI, getHentaiEmbedUrl, getHentaiThumbnailUrl } from '../api/hentaiApi';
import LazyImage from '../utils/LazyImage';
import { FiClock, FiPlay, FiArrowLeft } from 'react-icons/fi';

const HentaiDetailSkeleton = () => (
  <div className="container mx-auto p-4 md:p-8 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <div className="skeleton h-96 w-full rounded-lg"></div>
      </div>
      <div className="lg:col-span-3 space-y-6">
        <div className="skeleton h-10 w-3/4 rounded"></div>
        <div className="flex gap-2">
          <div className="skeleton h-6 w-24 rounded-full"></div>
          <div className="skeleton h-6 w-24 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-5/6 rounded"></div>
        </div>
        <div className="skeleton h-12 w-32 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const HentaiDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [hentai, setHentai] = useState<Hentai | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStoryboard, setShowStoryboard] = useState(false);

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
          {/* Cover Image */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-3">
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

            <Link
              to="/hentai"
              className="btn btn-primary"
            >
              <FiPlay className="mr-2" /> Xem danh sách khác
            </Link>
          </div>
        </section>
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
