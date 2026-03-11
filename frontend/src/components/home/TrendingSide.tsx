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
        title: "Wireless Onahole",
        image: "https://omegascans.org/_next/image?url=https%3A%2F%2Fmedia.omegascans.org%2Ffile%2FzFSsXt%2Fc2pkxyutdjkr2uzvdekasv4f.webp&w=640&q=75",
        views: "1.4K",
        slug: "wireless-onahole"
    },
    {
        id: 3,
        title: "Cô bạn gái quý giá của tôi",
        image: "https://dcnvn2.mgcdnxyz.cfd/images/covers/9ee2204a-4498-49a2-9123-8a9d17c613b4.jpg",
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