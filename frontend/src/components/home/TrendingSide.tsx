import { Link } from 'react-router-dom';
import { FiTrendingUp, FiChevronRight } from 'react-icons/fi';

// Mock data hoặc nhận props từ Home
const TRENDING_TODAY = [
    {
        id: 1,
        title: "Hagure Mate",
        image: "https://i4.hentailoop.com/2024/06/hagure-mate-e28892-yari-kyoushitsu-no-2-nen-c-gumi-e28892-page-1.jpg", 
        views: "1.8K",
        slug: "hagure-mate"
    },
    {
        id: 2,
        title: "Kiếm tiền và làm tình",
        image: "https://hentaivn.world/wp-content/uploads/kiem-tien-va-lam-tinh.webp",
        views: "1.4K",
        slug: "kiem-tien-va-lam-tinh"
    },
    {
        id: 3,
        title: "Cô bạn gái quý giá của tôi",
        image: "https://i2.mgcdnxyz.cfd/storage/images/covers/94c08dd8-2a69-4a09-b8cb-bbe83c7c983f.jpg",
        views: "1.1K",
        slug: "co-ban-gai-quy-gia-cua-toi"
    }
];

const TrendingSide = () => {
    return (
        <div className="bg-base-100 rounded-2xl p-5 shadow-lg h-full flex flex-col justify-between border border-base-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2 text-secondary">
                    <FiTrendingUp /> Top Hôm Nay
                </h3>
                <Link to="/search?sort=daily" className="text-xs opacity-60 hover:opacity-100 hover:text-primary transition-opacity">
                    Xem thêm
                </Link>
            </div>

            <div className="flex flex-col gap-4 flex-grow">
                {TRENDING_TODAY.map((item, index) => (
                    <Link 
                        key={item.id} 
                        to={`/manga/${item.slug}`} 
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors"
                    >
                        {/* Số thứ hạng */}
                        <span className={`text-2xl font-black italic w-6 text-center ${index === 0 ? 'text-warning' : index === 1 ? 'text-base-content/60' : 'text-base-content/40'}`}>
                            {index + 1}
                        </span>

                        {/* Ảnh nhỏ */}
                        <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden shadow-sm relative">
                            <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        {/* Thông tin */}
                        <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-xs text-base-content/60 mt-1">{item.views} lượt xem</p>
                        </div>

                        <FiChevronRight className="text-base-content/30 group-hover:text-primary transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TrendingSide;