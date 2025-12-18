import { Swiper, SwiperSlide } from 'swiper/react';
// 1. Bỏ import Pagination
import { Autoplay, EffectFade } from 'swiper/modules'; 
import { Link } from 'react-router-dom';

const BANNER_DATA = [
    {
        id: 1,
        bannerImg: '/banner/banner1.webp',
        charImg: '/banner/poster1.webp',
        link: '/manga/so-eun',
    },
    {
        id: 2,
        bannerImg: '/banner/banner2.webp',
        charImg: '/banner/poster2.webp',
        link: '/manga/dirty-talk',
    },
    {
        id: 3,
        bannerImg: '/banner/banner3.webp',
        charImg: '/banner/poster3.webp',
        link: '/manga/so-eun',
    }
];

const HeroBanner = () => {
    return (
        <div className="w-full my-12 relative z-10">
            <Swiper
                // 2. Bỏ Pagination khỏi danh sách modules
                modules={[Autoplay, EffectFade]} 
                
                effect={'fade'}
                fadeEffect={{ crossFade: true }}
                speed={800}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                
                // 3. Xóa dòng prop: pagination={{ ... }}
                
                loop={true}
                className="!overflow-visible w-full"
            >
                {BANNER_DATA.map((item) => (
                    <SwiperSlide key={item.id}>
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
                                        alt="Character" 
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