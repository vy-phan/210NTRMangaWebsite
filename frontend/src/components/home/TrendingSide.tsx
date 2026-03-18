import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import { getPromotionsAPI, type Promotion } from '../../api/promotionApi';

const TrendingSide = () => {
    const [trendingItems, setTrendingItems] = useState<Promotion[]>([]);

    useEffect(() => {
        const fetchTrending = async () => {
            const data = await getPromotionsAPI();
            setTrendingItems(data);
        };
        fetchTrending();
    }, []);

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
                {trendingItems.map((item, index) => (
                    <Link
                        key={item._id}
                        to={item.link.startsWith('http') ? item.link : `/manga/${item.link}`}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors"
                    >
                        {/* Số thứ hạng */}
                        <span className={`text-2xl font-black italic w-6 text-center ${index === 0 ? 'text-warning' : index === 1 ? 'text-base-content/60' : 'text-base-content/40'}`}>
                            {index + 1}
                        </span>

                        {/* Ảnh nhỏ */}
                        <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden shadow-sm relative">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                            />
                        </div>

                        {/* Thông tin */}
                        <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-xs text-base-content/60 mt-1">{item.views || '0'} lượt xem</p>
                        </div>

                        <FiChevronRight className="text-base-content/30 group-hover:text-primary transition-colors" />
                    </Link>
                ))}

                {trendingItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 opacity-50 italic text-sm">
                        Đang cập nhật...
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingSide;
