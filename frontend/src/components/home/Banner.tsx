import { useState, useEffect, useRef } from 'react';
import { ASSETS } from '../../constants/assets';

const bannerItems = [
    { id: 'item1', src: ASSETS.BANNER_DEFAULT_1 },
    { id: 'item2', src: ASSETS.BANNER_DEFAULT_2 },
    { id: 'item3', src: ASSETS.BANNER_DEFAULT_3 },
];

const SLIDE_INTERVAL = 3000;

const Banner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    // Tạo một ref để tham chiếu đến container của carousel
    const carouselRef = useRef<HTMLDivElement>(null);

    // Logic tự động chuyển slide (không đổi)
    useEffect(() => {
        const nextSlide = () => {
            setCurrentSlide(prev => (prev + 1) % bannerItems.length);
        };
        const intervalId = window.setInterval(nextSlide, SLIDE_INTERVAL);
        return () => window.clearInterval(intervalId);
    }, []);

    // === SỬA LẠI EFFECT NÀY ===
    // Effect để cuộn đến slide hiện tại một cách thủ công
    useEffect(() => {
        if (carouselRef.current) {
            // Tìm phần tử con tương ứng với slide hiện tại
            const slideElement = carouselRef.current.children[currentSlide] as HTMLElement;
            if (slideElement) {
                // Cuộn đến vị trí của slide đó
                carouselRef.current.scrollTo({
                    left: slideElement.offsetLeft,
                    behavior: 'smooth' // Thêm hiệu ứng cuộn mượt mà
                });
            }
        }
    }, [currentSlide]);

    // Hàm xử lý khi người dùng click vào nút điều hướng
    const handleNavClick = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div className="w-full flex justify-center px-4 md:px-8">
            <div className="w-full max-w-6xl">
                {/* Gắn ref vào đây */}
                <div ref={carouselRef} className="carousel w-full rounded-box aspect-video md:aspect-[3/1]">
                    {bannerItems.map((item) => (
                        <div key={item.id} id={item.id} className="carousel-item relative w-full">
                            <img src={item.src} className="w-full h-full object-cover" alt={`Banner ${item.id}`} />
                        </div>
                    ))}
                </div>

                <div className="flex w-full justify-center gap-2 py-2">
                    {bannerItems.map((_, index) => (
                        // Sử dụng button thay vì <a> để không thay đổi URL
                        <button
                            key={`nav-${index}`}
                            className={`btn btn-xs ${index === currentSlide ? 'btn-primary' : ''}`}
                            onClick={() => handleNavClick(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Banner;