import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiBookOpen, FiTrash2, FiCalendar, FiImage,
    FiLayers, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

// Interface định nghĩa dữ liệu chương truyện offline
// (Nên move vào file types chung nếu có thể, nhưng để đây cho tiện import)
export interface OfflineChapter {
    slug: string;
    chapterIndex: number;
    title: string;
    mangaTitle: string;
    images: any[];
    createdAt: number;
}

interface OfflineChapterListProps {
    chapters: OfflineChapter[];
    onDelete: (slug: string, index: number, mangaTitle: string, chapterTitle: string) => void;
    onDeleteManga?: (slug: string, mangaTitle: string) => void;
}

const OfflineChapterList: React.FC<OfflineChapterListProps> = ({ chapters, onDelete, onDeleteManga }) => {

    // Logic: Gom nhóm các chương theo Manga (dựa trên slug)
    const groupedChapters = useMemo(() => {
        const groups: Record<string, {
            mangaTitle: string;
            slug: string;
            chapters: OfflineChapter[];
            thumbnail: string | null;
            latestDate: number;
        }> = {};

        chapters.forEach(chap => {
            if (!groups[chap.slug]) {
                // Lấy ảnh đầu tiên của chương làm thumbnail đại diện cho truyện
                const firstImage = chap.images && chap.images.length > 0
                    ? (typeof chap.images[0] === 'string' ? chap.images[0] : chap.images[0].url)
                    : null;

                groups[chap.slug] = {
                    mangaTitle: chap.mangaTitle,
                    slug: chap.slug,
                    chapters: [],
                    thumbnail: firstImage,
                    latestDate: 0
                };
            }
            groups[chap.slug].chapters.push(chap);
            // Cập nhật ngày mới nhất để sort
            if (chap.createdAt > groups[chap.slug].latestDate) {
                groups[chap.slug].latestDate = chap.createdAt;
            }
        });

        // Chuyển object thành array và sort theo truyện mới đọc/tải gần nhất
        return Object.values(groups).sort((a, b) => b.latestDate - a.latestDate);
    }, [chapters]);

    if (chapters.length === 0) return null;

    return (
        <div className="space-y-6">
            {groupedChapters.map((group) => (
                <MangaGroupCard
                    key={group.slug}
                    group={group}
                    onDelete={onDelete}
                    onDeleteManga={onDeleteManga}
                />
            ))}
        </div>
    );
};

// Sub-component: Hiển thị từng nhóm truyện (Manga Card)
const MangaGroupCard = ({ group, onDelete, onDeleteManga }: {
    group: { mangaTitle: string, slug: string, chapters: OfflineChapter[], thumbnail: string | null },
    onDelete: (slug: string, index: number, mangaTitle: string, chapterTitle: string) => void,
    onDeleteManga?: (slug: string, mangaTitle: string) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Sort chapters: Chương mới nhất lên đầu
    const sortedChapters = [...group.chapters].sort((a, b) => b.chapterIndex - a.chapterIndex);

    return (
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden transition-all hover:shadow-md">
            {/* === Manga Header (Click để đóng mở) === */}
            <div
                className="p-4 flex gap-4 items-start cursor-pointer bg-base-100 hover:bg-base-200/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Thumbnail */}
                <div className="relative shrink-0">
                    <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden shadow-sm bg-base-300">
                        {group.thumbnail ? (
                            <img
                                src={group.thumbnail}
                                alt={group.mangaTitle}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-base-content/20">
                                <FiImage className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                    {/* Badge số lượng chương */}
                    <div className="absolute -top-2 -right-2 badge badge-secondary badge-md shadow-sm border-2 border-base-100 font-bold">
                        {group.chapters.length}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0 flex flex-col justify-between h-auto sm:h-28 py-1">
                    <div>
                        <h3 className="font-bold text-lg sm:text-xl line-clamp-2 text-base-content leading-tight mb-1">
                            {group.mangaTitle}
                        </h3>
                        <p className="text-xs text-base-content/60 flex items-center gap-1">
                            <FiLayers className="w-3 h-3" />
                            Đã tải {group.chapters.length} chương
                        </p>
                    </div>

                    {/* Action Hint (Mobile Only) */}
                    <div className="flex items-center justify-between mt-3 sm:mt-0">
                        <span className="text-xs text-primary font-medium flex items-center gap-1 opacity-80">
                            {isExpanded ? 'Thu gọn' : 'Xem danh sách'}
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </span>

                        {onDeleteManga && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteManga(group.slug, group.mangaTitle);
                                }}
                                className="btn btn-xs btn-error btn-outline"
                                title="Xóa toàn bộ bộ truyện này"
                            >
                                <FiTrash2 /> Xóa bộ truyện
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* === Chapter List (Accordion Content) === */}
            {isExpanded && (
                <div className="border-t border-base-200 bg-base-200/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                        {sortedChapters.map((chap) => (
                            <div
                                key={`${chap.slug}-${chap.chapterIndex}`}
                                className="flex items-center justify-between p-3 bg-base-100 rounded-lg border border-base-200 hover:border-primary/50 transition-colors group"
                            >
                                <div className="min-w-0 mr-2">
                                    <div className="font-bold text-sm text-base-content line-clamp-1">
                                        Chương {chap.title}
                                    </div>
                                    <div className="text-[10px] text-base-content/50 flex items-center gap-2 mt-0.5">
                                        <span className="flex items-center gap-0.5"><FiImage className="w-3 h-3" /> {chap.images?.length || 0} ảnh</span>
                                        <span className="border-l border-base-content/20 pl-2 flex items-center gap-0.5">
                                            <FiCalendar className="w-3 h-3" /> {new Date(chap.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <Link
                                        to={`/manga/${chap.slug}/chapter/${chap.chapterIndex + 1}`}
                                        className="btn btn-primary btn-sm btn-square sm:w-auto sm:px-3 text-xs"
                                        title="Đọc ngay"
                                    >
                                        <FiBookOpen className="w-4 h-4" />
                                        <span className="hidden sm:inline ml-1">Đọc</span>
                                    </Link>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(chap.slug, chap.chapterIndex, chap.mangaTitle, chap.title);
                                        }}
                                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                                        title="Xóa chương này"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfflineChapterList;
