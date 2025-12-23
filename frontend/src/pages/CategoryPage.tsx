import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiBookOpen } from 'react-icons/fi';
import { getMangaByCategoryAPI } from '../api/mangaApi';
import MangaGrid from '../components/manga/MangaGrid';

const CategoryPage = () => {
    const { categoryName } = useParams<{ categoryName: string }>();
    const [mangas, setMangas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMangas = async () => {
            if (!categoryName) return;

            try {
                setIsLoading(true);
                setError(null);
                // Gọi API lấy truyện theo category (Manga hoặc Manhwa)
                const data = await getMangaByCategoryAPI(categoryName);
                setMangas(data);
            } catch (err) {
                setError(`Không thể tải danh sách truyện ${categoryName}.`);
                toast.error('Lỗi khi tải dữ liệu!');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMangas();
    }, [categoryName]);

    // Các trạng thái UI
    if (isLoading) return <div className="flex justify-center items-center h-96"><span className="loading loading-ball loading-lg"></span></div>;
    if (error) return <div role="alert" className="alert alert-error"><span>{error}</span></div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* Header Section */}
            <header className="mb-10 border-b border-base-300 pb-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <FiBookOpen size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tight">
                            Truyện <span className="text-primary">{categoryName}</span>
                        </h1>
                        <p className="text-base-content/60 mt-1">
                            Các truyện có thể loại {categoryName}
                        </p>
                    </div>
                </div>
            </header>

            {/* Manga Grid List */}
            {mangas.length > 0 ? (
                <MangaGrid mangas={mangas} />
            ) : (
                <div className="text-center py-20 bg-base-200 rounded-3xl border-2 border-dashed border-base-300">
                    <p className="text-xl font-medium text-base-content/50">Chưa có truyện nào thuộc thể loại này.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;