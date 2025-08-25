import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiBookOpen, FiBookmark, FiClock, FiMessageSquare } from 'react-icons/fi';
import { formatTimeAgo } from '../utils/dateFomat';
import { getMangaBySlugAPI } from '../api/mangaApi';
import MangaStatusBadge from '../components/common/MangaStatusBadge';
import { getChaptersByMangaIdAPI } from '../api/chapterApi';
import LazyImage from '../utils/LazyImage';

// Component con để hiển thị skeleton loading
const DetailMangaSkeleton = () => (
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
        <div className="flex gap-4">
          <div className="skeleton h-12 w-32 rounded-lg"></div>
          <div className="skeleton h-12 w-32 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

const DetailManga = () => {
  // 1. Lấy slug từ URL
  const { slug } = useParams<{ slug: string }>();

  // 2. State để quản lý dữ liệu, loading và lỗi
  const [manga, setManga] = useState<Manga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);


  useEffect(() => {
    if (!slug) {
      setError("Không tìm thấy slug truyện.");
      setIsLoading(false);
      return;
    }

    const fetchMangaDetails = async () => {
      try {
        setIsLoading(true);
        const data = await getMangaBySlugAPI(slug);
        setManga(data);
        if (data?._id) {
          setIsLoadingChapters(true);
          try {
            const chaptersData = await getChaptersByMangaIdAPI(data._id);
            setChapters(chaptersData);
          } catch (chapterError) {
            console.error("Failed to fetch chapters", chapterError);
          } finally {
            setIsLoadingChapters(false);
          }
        }
      } catch (err) {
        setError("Không tìm thấy truyện hoặc đã có lỗi xảy ra.");
        toast.error("Không thể tải chi tiết truyện.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangaDetails();
  }, [slug]); // Chạy lại mỗi khi slug thay đổi

  // 4. Xử lý các trạng thái UI
  if (isLoading) return <DetailMangaSkeleton />;

  if (error || !manga) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-error">{error || "Không tìm thấy dữ liệu truyện."}</h1>
        <Link to="/" className="btn btn-primary mt-4">Quay về trang chủ</Link>
      </div>
    );
  }

  // 5. Giao diện chính khi đã có dữ liệu
  return (
    <div className="bg-base-200 py-8">
      <div className="container mx-auto p-4 md:p-8">
        {/* === HERO BANNER SECTION === */}
        <section className="relative h-64 md:h-80 lg:h-96 w-full">
          {/* Ảnh nền panorama */}
          <LazyImage
            src={manga.poster}
            alt={manga.title}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
          {/* Lớp phủ gradient để làm mờ và tối ảnh nền */}
          <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/80 to-transparent"></div>
        </section>

        {/* Phần Thông Tin Chính */}
        <section className="container mx-auto p-4 md:px-8 -mt-24 md:-mt-32 lg:-mt-40 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">

            {/* Cột Poster (Đã sửa) */}
            <div className="md:col-span-1">
              <figure className="aspect-[3/4] w-full max-w-xs rounded-lg shadow-2xl overflow-hidden mx-auto lg:mx-0">
                <img src={manga.poster} alt={manga.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </figure>
            </div>

            {/* Cột Chi Tiết */}
            <div className="md:col-span-3 flex flex-col justify-end pb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-base-content">{manga.title}</h1>

              <div className="flex items-center gap-2 text-base-content/70 mt-2">
                <FiClock className="w-4 h-4" />
                <span>Cập nhật {formatTimeAgo(manga.updatedAt)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 my-4">
                <MangaStatusBadge status={manga.status} />
                {manga.genres?.map(genre => typeof genre !== 'string' && (
                  <Link key={genre._id} to={`/genre/${genre.slug}`} className="badge badge-ghost badge-outline hover:bg-primary hover:text-primary-content">
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Nút hành động, chỉ hiển thị khi đã tải xong chương */}
              {!isLoadingChapters && chapters.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2">
                  {(() => {
                    // Tìm chương đầu tiên (số nhỏ nhất) và chương mới nhất (số lớn nhất)
                    const firstChapter = chapters.reduce((prev, current) => (prev.number < current.number ? prev : current));
                    const latestChapter = chapters.reduce((prev, current) => (prev.number > current.number ? prev : current));

                    return (
                      <>
                        {/* Nút Đọc từ đầu */}
                        <Link
                          to={`/manga/${slug}/chapter/${firstChapter.number}`}
                          className="btn btn-primary btn-md"
                        >
                          <FiBookOpen /> Đọc từ đầu (Ch. {firstChapter.number})
                        </Link>

                        {/* Nút Đọc chương mới nhất */}
                        <Link
                          to={`/manga/${slug}/chapter/${latestChapter.number}`}
                          className="btn btn-ghost btn-md border border-base-content/20"
                        >
                          <FiBookmark />
                          Chương mới nhất (Ch. {latestChapter.number})
                        </Link>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Hiển thị thông báo nếu chưa có chương */}
              {!isLoadingChapters && chapters.length === 0 && (
                <div className="mt-2">
                  <button className="btn btn-disabled btn-md">Truyện chưa có chương</button>
                </div>
              )}
            </div>
          </div>
        </section>
        <div className="container mx-auto p-4 md:px-8 mt-8">
          {/*=== THÊM SECTION MÔ TẢ VÀO ĐÂY === */}
          {/* === SECTION MÔ TẢ (HIỂN THỊ TRỰC TIẾP) === */}
          <section className="mb-12">
            {/* Tiêu đề của section */}
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-2">Tóm tắt nội dung</h2>

            {/* Panel chứa nội dung mô tả */}
            <div className="bg-base-100 p-4 md:p-6 rounded-box shadow-lg">
              <p className="text-base-content/90 whitespace-pre-wrap">
                {manga.description || "Truyện này hiện chưa có mô tả."}
              </p>
            </div>
          </section>
          {/* Phần Danh Sách Chương */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-2">Danh Sách Chương</h2>
            <div className="bg-base-100 p-4 rounded-box shadow-lg">
              {isLoadingChapters ? (
                // Hiển thị skeleton cho danh sách chương
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-12 w-full"></div>
                  ))}
                </div>
              ) : chapters.length > 0 ? (
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {chapters.map(chapter => (
                    <li key={chapter._id}>
                      <Link
                        to={`/manga/${slug}/chapter/${chapter.number}`}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-base-200"
                      >
                        <span className="font-semibold">Chương {chapter.title}</span>
                        <span className="text-sm text-base-content/60">{formatTimeAgo(chapter.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                // Hiển thị khi không có chương nào
                <p className="text-center p-4">Truyện này chưa có chương nào.</p>
              )}
            </div>
          </section>

          {/* (Tùy chọn) Phần Bình Luận */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-2">Bình Luận</h2>
            <div className="bg-base-100 p-4 rounded-box shadow-lg text-center">
              <FiMessageSquare className="mx-auto text-4xl text-base-content/30 mb-2" />
              <p>Tính năng bình luận sẽ được cập nhật sớm.</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default DetailManga;