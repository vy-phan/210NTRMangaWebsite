import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { getBannersAPI } from '../../api/bannerApi';


const CACHE_KEY = 'BANNER_CACHE_DATA';
const CACHE_TIME_KEY = 'BANNER_CACHE_TIME';
const CACHE_DURATION = 30 * 60 * 1000;


const STATIC_BANNER_DATA: any[] = [
    {
        _id: 'static_1',
        title: 'Mẫu 1',
        bannerImg: '/banner/banner1.webp',
        charImg: '/banner/poster1.webp',
        link: '/manga/so-eun',
        active: true,
        priority: 3
    },
    {
        _id: 'static_2',
        title: 'Mẫu 2',
        bannerImg: '/banner/banner2.webp',
        charImg: '/banner/poster2.webp',
        link: '/manga/dirty-talk',
        active: true,
        priority: 2
    },
    {
        _id: 'static_3',
        title: 'Mẫu 3',
        bannerImg: '/banner/banner3.webp',
        charImg: '/banner/poster3.webp',
        link: '/manga/so-eun',
        active: true,
        priority: 1
    }
];

const HeroBanner = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            const now = new Date().getTime();
            const cachedData = localStorage.getItem(CACHE_KEY);
            const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

            // 1. KIỂM TRA CACHE TRƯỚC
            if (cachedData && cachedTime) {
                const timeDiff = now - parseInt(cachedTime);
                if (timeDiff < CACHE_DURATION) {
                    setBanners(JSON.parse(cachedData));
                    setIsLoading(false);
                    return;
                }
            }

            // 2. GỌI API (Nếu không có cache hoặc cache hết hạn)
            try {
                // console.log(">>> Cache hết hạn hoặc không có -> Gọi API mới...");
                const data = await getBannersAPI();

                if (data && data.length > 0) {
                    setBanners(data);
                    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                    localStorage.setItem(CACHE_TIME_KEY, now.toString());
                } else {
                    setBanners(STATIC_BANNER_DATA);
                }
            } catch (error) {
                console.error("Lỗi gọi API Banner, sử dụng dữ liệu cũ:", error);

                // 3. XỬ LÝ LỖI: FALLBACK
                // Nếu gọi API lỗi, thử dùng cache cũ (dù hết hạn) cho đỡ trống
                if (cachedData) {
                    setBanners(JSON.parse(cachedData));
                } else {
                    setBanners(STATIC_BANNER_DATA);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Loading State (Skeleton đơn giản)
    if (isLoading) {
        return <div className="w-full my-12 h-[180px] sm:h-[250px] md:h-[350px] bg-base-300 rounded-3xl animate-pulse"></div>;
    }

    // Nếu không có banner nào (API rỗng + Static rỗng) -> Không render
    if (!banners || banners.length === 0) return null;

    return (
        <div className="w-full my-12 relative z-10">
            <Swiper
                modules={[Autoplay, EffectFade]}
                effect={'fade'}
                fadeEffect={{ crossFade: true }}
                speed={800}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                // Chỉ loop nếu có nhiều hơn 1 banner
                loop={banners.length > 1}
                className="!overflow-visible w-full"
            >
                {banners.map((item) => (
                    <SwiperSlide key={item._id}>
                        {({ isActive }) => (
                            <Link to={item.link} className="relative block w-full group cursor-pointer select-none">

                                {/* --- BANNER NỀN --- */}
                                <div className="
                                    relative w-full 
                                    h-[180px] sm:h-[250px] md:h-[350px] 
                                    rounded-3xl overflow-hidden shadow-2xl bg-base-300
                                ">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[8s] group-hover:scale-105"
                                        style={{ backgroundImage: `url(${item.bannerImg})` }}
                                    >
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500"></div>
                                    </div>
                                </div>

                                {/* --- ẢNH NHÂN VẬT --- */}
                                <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-20">
                                    <img
                                        src={item.charImg}
                                        alt={item.title}
                                        className={`
                                            h-[140%] sm:h-[150%] w-auto object-contain 
                                            drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]
                                            
                                            transition-all duration-700 ease-out
                                            ${isActive
                                                ? 'opacity-100 scale-100 translate-y-0 blur-0'
                                                : 'opacity-0 scale-90 translate-y-4 blur-sm'}

                                            ${isActive ? 'group-hover:scale-105 group-hover:-translate-y-1' : ''}
                                        `}
                                    />
                                </div>

                            </Link>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default HeroBanner;