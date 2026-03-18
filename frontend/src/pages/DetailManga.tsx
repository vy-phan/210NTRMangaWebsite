import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiBookOpen, FiBookmark, FiClock, FiMaximize2, FiMessageSquare, FiUser, FiX } from 'react-icons/fi';
import { formatTimeAgo } from '../utils/dateFomat';
import { getMangaBySlugAPI, getRelatedMangasAPI } from '../api/mangaApi';
import MangaStatusBadge from '../components/common/MangaStatusBadge';
import { getChaptersByMangaIdAPI } from '../api/chapterApi';
import LazyImage from '../utils/LazyImage';
import SeoTags from '../components/manga/SeoTags';
import ShareChapterModal from '../components/manga/ShareChapterModal';
import ChapterListDownloadButton from '../components/manga/ChapterListDownloadButton';
import RelatedMangaList from '../components/manga/RelatedMangaList';
import BulkDownloadButton from '../components/manga/BulkDownloadButton';
import { useHistoryStore } from '../store/useHistoryStore';

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

  const toViStatus = (s?: 'Ongoing' | 'Completed' | 'Cancelled') => {
    switch (s) {
      case 'Ongoing':
        return 'Đang cập nhật';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return '';
    }
  };

  // 2. State để quản lý dữ liệu, loading và lỗi
  const [manga, setManga] = useState<Manga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToHistory, history } = useHistoryStore();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [relatedMangas, setRelatedMangas] = useState<Manga[]>([]);
  const [isContentHidden, setIsContentHidden] = useState(() => localStorage.getItem('isContentHidden') === 'true');

  const zoomModalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const checkHiddenState = () => {
      setIsContentHidden(localStorage.getItem('isContentHidden') === 'true');
    };
    window.addEventListener('storage-local-change', checkHiddenState);
    return () => {
      window.removeEventListener('storage-local-change', checkHiddenState);
    };
  }, []);

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
          // 1. Fetch Chapters (Giữ nguyên)
          setIsLoadingChapters(true);
          getChaptersByMangaIdAPI(data._id)
            .then(setChapters)
            .catch(console.error)
            .finally(() => setIsLoadingChapters(false));

          // 2. Fetch Related Mangas (MỚI THÊM)
          // Lấy danh sách ID của các thể loại
          const genreIds = data.genres?.map((g: any) => typeof g === 'string' ? g : g._id) || [];


          if (genreIds.length > 0) {
            getRelatedMangasAPI(data._id, genreIds)
              .then(setRelatedMangas)
              .catch(console.error);
          }
        }
      } catch (err) {
        setError("Không tìm thấy truyện hoặc đã có lỗi xảy ra.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMangaDetails();
  }, [slug]);

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

  const handleZoomImage = () => {
    if (zoomModalRef.current) {
      zoomModalRef.current.showModal();
    }
  };

  const checkIsRead = (chapterNum: number) => {
    if (!manga) return false;
    return history.some(h => h.mangaId === manga._id && h.chapterNumber === chapterNum);
  };

  // === 3. HÀM XỬ LÝ LƯU LỊCH SỬ ===
  const handleReadChapter = (chapter: Chapter) => {
    if (!manga) return;
    const historyChapter = {
      ...chapter,
      number: chapter.number + 1,
      title: chapter.title || `${chapter.number + 1}`
    };

    addToHistory(manga, historyChapter);
  };

  const isNewChapter = (createdAt?: string | Date) => {
    if (!createdAt) return false;
    const diff = new Date().getTime() - new Date(createdAt).getTime();
    return diff > 0 && diff < 24 * 60 * 60 * 1000; // Dưới 24h và không phải tương lai
  };

  const isOneshot = !isLoadingChapters && chapters.length === 1;

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
            <div className="md:col-span-1 group relative cursor-zoom-in" onClick={handleZoomImage}>
              <figure className="aspect-[3/4] w-full max-w-xs rounded-lg shadow-2xl overflow-hidden mx-auto lg:mx-0 bg-base-300 relative">
                <img
                  src={manga.poster}
                  alt={manga.title}
                  className={`
                        w-full h-full object-cover transition-all duration-500
                        ${isContentHidden ? 'blur-xl scale-110' : 'blur-0 scale-100'}
                        group-hover:scale-105
                    `}
                  referrerPolicy="no-referrer"
                />

                {/* Icon Zoom gợi ý khi hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  <FiMaximize2 className="text-white w-10 h-10 drop-shadow-lg" />
                </div>
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
                <Link to={`/category/${manga.category}`} className={`badge badge-outline font-semibold ${manga.category === 'Manga'
                  ? 'badge-info '
                  : 'badge-secondary'
                  }`}>
                  {manga.category}
                </Link>
                {manga.genres?.map(genre => typeof genre !== 'string' && (
                  <Link key={genre._id} to={`/genre/${genre.slug}`} className="badge badge-ghost badge-outline hover:bg-primary hover:text-primary-content">
                    {genre.name}
                  </Link>
                ))}
              </div>

              {(manga.author || manga.artist) && (
                <div className="flex flex-col gap-2 mt-1">
                  {manga.author && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold shrink-0">
                        <FiUser className="w-3.5 h-3.5" />
                        Tác giả
                      </div>
                      <span className="text-sm font-medium text-base-content hover:text-primary transition-colors cursor-pointer">
                        {manga.author}
                      </span>
                    </div>
                  )}
                  {manga.artist && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-3 py-1 text-xs font-semibold shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Họa sĩ
                      </div>
                      <span className="text-sm font-medium text-base-content hover:text-secondary transition-colors cursor-pointer">
                        {manga.artist}
                      </span>
                    </div>
                  )}
                  {manga.externalUrl && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-accent/10 text-accent border border-accent/20 rounded-full px-3 py-1 text-xs font-semibold shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Nguồn Raw
                      </div>
                      <a
                        href={manga.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-info hover:underline truncate max-w-[200px]"
                      >
                        Nguồn link gốc
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2">
                {isLoadingChapters && (
                  <div className="skeleton h-12 w-40 rounded-lg"></div>
                )}

                {!isLoadingChapters && chapters.length > 0 && (
                  isOneshot ? (
                    // === Case: Oneshot ===
                    <Link
                      to={`/manga/${slug}/chapter/${chapters[0].number + 1}`}
                      className="btn btn-primary btn-md"
                      onClick={() => handleReadChapter(chapters[0])}
                    >
                      <FiBookOpen /> Đọc Oneshot
                    </Link>
                  ) : (
                    // === Case: Nhiều chương ===
                    (() => {
                      const firstChapter = chapters[chapters.length - 1];
                      const latestChapter = chapters[0];
                      return (
                        <>
                          <Link
                            to={`/manga/${slug}/chapter/${firstChapter.number + 1}`}
                            className="btn btn-primary btn-md"
                            onClick={() => handleReadChapter(firstChapter)}
                          >
                            <FiBookOpen /> Đọc từ đầu (Ch. {firstChapter.title})
                          </Link>
                          <Link
                            to={`/manga/${slug}/chapter/${latestChapter.number + 1}`}
                            className="btn btn-ghost btn-md border border-base-content/20"
                            onClick={() => handleReadChapter(latestChapter)}
                          >
                            <FiBookmark /> Chương mới nhất (Ch. {latestChapter.title})
                          </Link>
                        </>
                      );
                    })()
                  )
                )}

                {!isLoadingChapters && chapters.length === 0 && (
                  <button className="btn btn-disabled btn-md">Truyện chưa có chương</button>
                )}

                <ShareChapterModal />

                {/* Nút tải nhiều chương (Mobile & Desktop) */}
                {chapters.length > 0 && (
                  <BulkDownloadButton slug={slug!} chapters={chapters} />
                )}
              </div>

            </div>
          </div>
        </section>
        <div className="container mx-auto p-4 md:px-8 mt-8">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-2">Tóm tắt nội dung</h2>
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
                <ul className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {chapters.map(chapter => {
                    // Tính toán trạng thái đã đọc
                    const displayNum = chapter.number + 1;
                    const isRead = checkIsRead(displayNum);

                    return (
                      <li
                        key={chapter._id}
                        className={`
                              flex items-center justify-between p-3 rounded-lg transition-colors group border 
                              ${isRead
                            ? 'bg-base-200/50 border-transparent' // Đã đọc: Nền tối hơn chút, không viền
                            : 'hover:bg-base-200 border-transparent hover:border-base-300' // Chưa đọc: Hiệu ứng hover bình thường
                          }
                            `}
                      >
                        {/* === KHU VỰC TRÁI === */}
                        <div className="flex flex-row items-center gap-2 flex-grow min-w-0 pr-3">
                          <Link
                            to={`/manga/${slug}/chapter/${displayNum}`}
                            // Logic CSS: Nếu đã đọc thì màu xám nhạt (content/50), chưa đọc thì đậm (semibold)
                            className={`
                                transition-colors truncate
                                ${isRead
                                ? 'text-base-content/50 font-normal decoration-slice'
                                : 'font-semibold text-base-content group-hover:text-primary'
                              }
                                      `}
                            title={isOneshot ? 'Oneshot' : `Chương ${chapter.title}`}
                            onClick={() => handleReadChapter(chapter)}
                          >
                            {isOneshot ? 'Oneshot' : `Chương ${chapter.title}`}
                          </Link>

                          {isNewChapter(chapter.createdAt) && (
                            <span className="bg-red-500 px-1.5 py-1 rounded-full text-[10px] font-bold text-white">Mới</span>
                          )}

                          <span className="text-[10px] text-base-content/40 mt-0.5 sm:hidden whitespace-nowrap">
                            {formatTimeAgo(chapter.createdAt)}
                          </span>
                        </div>

                        {/* === KHU VỰC PHẢI === */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-sm hidden sm:inline-block ${isRead ? 'text-base-content/30' : 'text-base-content/60'}`}>
                            {formatTimeAgo(chapter.createdAt)}
                          </span>
                          <ChapterListDownloadButton
                            slug={slug!}
                            chapter={chapter}
                          />
                        </div>
                      </li>
                    );
                  })}
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

          {relatedMangas.length > 0 && (
            <RelatedMangaList mangas={relatedMangas} />
          )}

          <dialog ref={zoomModalRef} className="modal">
            {/* 1. Backdrop: Chỉnh màu đen nhạt hơn (60%) để thấy nền web phía sau */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

            {/* 2. Container: Loại bỏ max-width mặc định, cho phép ảnh to thoải mái theo chiều cao */}
            <div className="modal-box max-w-none w-auto p-4 bg-transparent shadow-none overflow-visible flex justify-center items-center z-10">

              {/* Nút Đóng (Đưa ra xa một chút cho thoáng) */}
              <form method="dialog">
                <button className="btn btn-circle btn-ghost text-white absolute -top-2 -right-2 md:top-4 md:right-4 z-50 bg-black/20 hover:bg-black/50 border-none backdrop-blur-md">
                  <FiX className="w-6 h-6" />
                </button>
              </form>

              {/* 3. Ảnh Full */}
              <img
                src={manga.poster}
                alt={manga.title}
                className={`
                /* Kích thước: Cao 90% màn hình, rộng tự động */
                h-[85vh] md:h-[90vh] w-auto object-contain 
                
                /* Bo góc và đổ bóng sâu để tạo cảm giác nổi 3D */
                rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]
                
                /* Animation & Hover Effect */
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-[0_0_70px_rgba(0,0,0,0.7)]
                
                /* Logic Blur */
                ${isContentHidden ? 'blur-2xl scale-100' : ''} 
            `}
                referrerPolicy="no-referrer"
                // Click vào ảnh để bỏ che (nếu đang che) hoặc đóng modal (nếu không che - tuỳ chọn)
                onClick={(e) => {
                  e.stopPropagation();
                  if (isContentHidden) setIsContentHidden(false);
                }}
              />
            </div>

            {/* Click backdrop để đóng */}
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          {/* SEO TAG */}
          {manga && (
            <SeoTags
              title={`${manga.title} | Đọc truyện tranh online`}
              description={manga.description || `${manga.title} - Đọc truyện tranh online, cập nhật chương mới nhất.`}
              keywords={((() => {
                const base: string[] = [
                  manga.title,
                  manga.slug,
                  toViStatus(manga.status),
                  'manga', 'truyện tranh', 'doc truyen', 'đọc truyện', 'chapter', 'oneshot', 'comic', 'manhwa', 'manga viet',
                ];
                const genreTokens = (manga.genres || []).map(g => typeof g === 'string' ? g : (g.name || g.slug)).filter(Boolean) as string[];
                const combos = genreTokens.flatMap(gn => [
                  `${manga.title} ${gn}`,
                  `${gn} ${manga.title}`,
                ]);
                return [...base, ...genreTokens, ...combos].filter(Boolean);
              })())}
              image={manga.poster}
              url={typeof window !== 'undefined' ? window.location.href : undefined}
              type="article"
              publishedTime={manga.createdAt}
              updatedTime={manga.updatedAt}
              canonical={typeof window !== 'undefined' ? window.location.href : undefined}
              locale="vi_VN"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailManga;