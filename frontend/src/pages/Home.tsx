import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiHash } from "react-icons/fi";
import Banner from "../components/home/Banner";
import RankingSidebar from "../components/home/RankingSidebar";
import MangaGrid from "../components/manga/MangaGrid";
import { getAllMangasAPI, getGenreStatsAPI } from "../api/mangaApi";
import { useNetworkStatus } from "../hook/useNetworkStatus";
import HeroBanner from "../components/home/HeroBanner";
import TrendingSide from "../components/home/TrendingSide";
import { useContentHidden } from "../context/ContentHiddenContext";
import { useProgressiveReveal } from "../hook/useProgressiveReveal";

const Home = () => {
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isOnline = useNetworkStatus();
    const { isContentHidden } = useContentHidden();
    const [hotTags, setHotTags] = useState<string[]>([]);

    useEffect(() => {
        if (!isOnline) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [mangaData, statsData] = await Promise.all([
                    getAllMangasAPI(),
                    getGenreStatsAPI()
                ]);

                const sortedData = mangaData.sort((a, b) =>
                    new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
                );
                setMangas(sortedData);

                if (statsData && statsData) {
                    setHotTags(statsData.map((g: any) => g.name));
                }

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isOnline]);

    const rankedMangas = useMemo(() => mangas.slice(0, 10), [mangas]);

    // Chỉ render 9 truyện đầu, tăng dần 9 truyện mỗi khi cuộn gần tới cuối
    const { visibleItems: visibleMangas, hasMore, sentinelRef } = useProgressiveReveal(mangas, 9, 9);

    return (
        <div className="pb-10">
            {isContentHidden ? (
                <section className="mb-8">
                    <Banner />
                </section>
            ) : (
                <section className="container mx-auto my-8 px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[420px]">
                        <div className="hidden lg:block lg:col-span-4 h-full pt-4">
                            <TrendingSide />
                        </div>
                        <div className="lg:col-span-8 w-full h-full">
                            <HeroBanner />
                        </div>
                    </div>
                </section>
            )}

            {/* Teaser UI mới (ui-v2) */}
            <section className="container mx-auto px-4 mt-16">
                <Link
                    to="/ntr"
                    className="flex items-center gap-3 p-3 md:p-4 rounded-box bg-gradient-to-r from-primary/15 via-secondary/10 to-accent/15 border border-primary/30 hover:border-primary transition-colors group"
                >
                    <span className="badge badge-primary badge-lg shrink-0">Mới</span>
                    <span className="flex-1 min-w-0">
                        <span className="block text-sm md:text-base font-bold text-base-content group-hover:text-primary transition-colors">
                            Giao diện mới đang thử nghiệm
                        </span>
                        <span className="block text-xs text-base-content/60 truncate">
                            Trải nghiệm UI-v2: đọc truyện, thư viện, lịch sử theo phong cách mới
                        </span>
                    </span>
                    <span className="btn btn-xs md:btn-sm btn-primary shrink-0">Dùng thử →</span>
                </Link>
            </section>

            <section className="container mx-auto px-4">
                {!isOnline ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-base-200 rounded-box text-center shadow-inner">
                        <h2 className="text-3xl font-bold">Mất kết nối Internet</h2>
                        <Link to="/offline" className="btn btn-primary mt-4">Vào Tủ Sách Offline</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* === CỘT CHÍNH (9/12) === */}
                        <div className="lg:col-span-9 col-span-12 flex flex-col gap-8">
                            <div className="bg-base-200 p-4 md:p-6 rounded-box shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold border-l-4 border-primary pl-3">Mới Cập Nhật</h2>
                                    <Link to="/search" className="btn btn-xs btn-ghost">Xem tất cả</Link>
                                </div>
                                <MangaGrid mangas={visibleMangas} isLoading={isLoading} />

                                {/* Sentinel: phần tử vô hình để phát hiện khi cuộn gần tới cuối danh sách đang hiện */}
                                {hasMore && (
                                    <div ref={sentinelRef} className="flex justify-center py-6">
                                        <span className="loading loading-dots loading-md text-primary"></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* === CỘT PHỤ (SIDEBAR) (3/12) === */}
                        <div className="lg:col-span-3 col-span-12 flex flex-col gap-6">
                            <RankingSidebar mangas={rankedMangas} title="Top Xem Nhiều" />

                            <div className="card bg-base-100 shadow-xl border border-base-200">
                                <div className="card-body p-5">
                                    <h3 className="font-bold text-lg flex items-center gap-2 mb-2">
                                        <FiHash className="text-secondary" /> Từ Khóa Hot
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {hotTags.map(tag => (
                                            <Link
                                                key={tag}
                                                to={`/genre/${tag.toLowerCase()}`}
                                                className="badge badge-outline hover:badge-primary cursor-pointer transition-colors duration-150 p-3"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {!isContentHidden && (
                                <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden group relative">
                                    <figure className="relative w-full aspect-[3/4] cursor-pointer">
                                        <img
                                            src="https://cdn2.hentaigifz.com/57750/anime-big-tits-miyazaki-chisaki-scaled.webp"
                                            alt="Featured Content"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </figure>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;