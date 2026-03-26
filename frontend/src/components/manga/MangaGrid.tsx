import MangaCard from './MangaCard';

interface MangaGridProps {
    mangas: Manga[];
    isLoading?: boolean; // (Tùy chọn) để hiển thị skeleton loading
}

const MangaGrid = ({ mangas, isLoading = false }: MangaGridProps) => {


    if (isLoading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="skeleton h-96 w-full"></div>
                ))}
            </div>
        );
    }

    if (!mangas || mangas.length === 0) {
        return <div className="text-center py-16 bg-base-200 rounded-lg">Không tìm thấy truyện nào.</div>
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {mangas.map(manga => (
                <MangaCard key={manga._id} manga={manga} />
            ))}
        </div>
    );
};

export default MangaGrid;