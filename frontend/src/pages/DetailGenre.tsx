import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getGenreBySlugAPI } from '../api/genreApi';
import MangaGrid from '../components/manga/MangaGrid'; // Tái sử dụng MangaGrid

// Skeleton cho trang chi tiết thể loại
const DetailGenreSkeleton = () => (
    <div className="container mx-auto p-4 md:p-8 animate-pulse">
        <div className="skeleton h-12 w-1/3 mb-4 rounded"></div>
        <div className="skeleton h-24 w-full rounded-lg"></div>
        <div className="skeleton h-8 w-1/4 mt-12 mb-4 rounded"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-80 w-full"></div>
            ))}
        </div>
    </div>
);


const DetailGenre = () => {
    const { slug } = useParams<{ slug: string }>();

    // State để lưu cả thông tin genre và danh sách mangas
    const [genreInfo, setGenreInfo] = useState<Genre | null>(null);
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setError("Không tìm thấy slug thể loại.");
            return;
        }

        const fetchGenreDetails = async () => {
            try {
                setIsLoading(true);
                const { genre, mangas } = await getGenreBySlugAPI(slug);
                setGenreInfo(genre);
                setMangas(mangas);
            } catch (err) {
                setError("Không tìm thấy thể loại hoặc đã có lỗi xảy ra.");
                toast.error("Không thể tải dữ liệu thể loại.");
            } finally {
                setIsLoading(false);
            }
        };

        window.scrollTo(0, 0); // Cuộn lên đầu trang mỗi khi slug thay đổi
        fetchGenreDetails();
    }, [slug]);

    if (isLoading) return <DetailGenreSkeleton />;

    if (error || !genreInfo) {
        return (
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-2xl font-bold text-error">{error || "Không tìm thấy dữ liệu."}</h1>
                <Link to="/genres" className="btn btn-primary mt-4">Xem tất cả thể loại</Link>
            </div>
        );
    }

    return (
           <div className="bg-base-200 py-8 min-h-full">
            <div className="container mx-auto p-4 md:p-8">
                {/* Header của trang */}
                <header className="mb-8">
                    <p className="text-sm text-base-content/60">Thể loại</p>
                    <h1 className="text-4xl font-bold text-primary">{genreInfo.name}</h1>
                </header>

                {/* Mô tả thể loại */}
                {genreInfo.description && (
                    <section className="mb-12">
                        {/* Panel mô tả sẽ có màu bg-base-100, nổi bật trên nền bg-base-200 */}
                        <div className="prose max-w-none bg-base-100 p-6 rounded-box shadow-lg">
                            <p>{genreInfo.description}</p>
                        </div>
                    </section>
                )}

                {/* Danh sách truyện */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">
                        Truyện thuộc thể loại "{genreInfo.name}" ({mangas.length})
                    </h2>
                    {/* MangaGrid sẽ được render trên nền bg-base-200 */}
                    <MangaGrid mangas={mangas} />
                </section>
            </div>
        </div>
    );
};

export default DetailGenre;