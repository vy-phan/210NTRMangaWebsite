import { useState, useCallback, useEffect, useRef } from 'react';
import MangaCard from './MangaCard';

interface MangaGridProps {
    mangas: Manga[];
    isLoading?: boolean; // (Tùy chọn) để hiển thị skeleton loading
}

const ITEMS_PER_PAGE = 20;

const MangaGrid = ({ mangas, isLoading = false }: MangaGridProps) => {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [isAutoLoading, setIsAutoLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(() => {
        if (isAutoLoading) return;
        setIsAutoLoading(true);
        setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, mangas.length));
        setTimeout(() => setIsAutoLoading(false), 300);
    }, [mangas.length, isAutoLoading]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < mangas.length) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [visibleCount, mangas.length, loadMore]);

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

    const visibleMangas = mangas.slice(0, visibleCount);
    const hasMore = visibleCount < mangas.length;

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {visibleMangas.map(manga => (
                    <MangaCard key={manga._id} manga={manga} />
                ))}
            </div>
            {hasMore && (
                <div ref={observerRef} className="flex justify-center mt-8">
                    <div className="loading loading-spinner loading-md text-primary"></div>
                </div>
            )}
        </div>
    );
};

export default MangaGrid;