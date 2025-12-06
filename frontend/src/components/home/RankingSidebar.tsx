import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/dateFomat';

// Số lượng item hiển thị ban đầu
const ITEMS_PER_PAGE = 5;

interface RankingItemProps {
  manga: Manga;
  rank: number;
}

const RankingItem = ({ manga, rank }: RankingItemProps) => {
  const [isContentHidden, setIsContentHidden] = useState(() => localStorage.getItem('isContentHidden') === 'true');
  useEffect(() => {
    const checkHiddenState = () => {
      setIsContentHidden(localStorage.getItem('isContentHidden') === 'true');
    };

    window.addEventListener('storage-local-change', checkHiddenState);
    
    return () => {
      window.removeEventListener('storage-local-change', checkHiddenState);
    };
  }, []);

  // Lấy màu sắc đặc biệt cho top 3
  const rankColor =
    rank === 1 ? 'text-red-500' :
      rank === 2 ? 'text-orange-400' :
        rank === 3 ? 'text-yellow-500' :
          'text-base-content/50';

  return (
    <li>
      <Link to={`/manga/${manga.slug}`} className="flex items-start gap-4 p-2.5 hover:bg-base-200 rounded-lg transition-colors duration-200 group">
        {/* Số thứ hạng được thiết kế lại */}
        <div className={`text-3xl font-black w-8 text-center ${rankColor} transition-transform duration-300 group-hover:scale-110`}>
          {rank}
        </div>

        {/* Ảnh bìa */}
        <div className="avatar flex-shrink-0">
          <div className="w-16 rounded-md shadow overflow-hidden"> 
            {/* overflow-hidden ở thẻ cha giúp bo góc mượt hơn khi ảnh bị blur */}
            <img 
              src={manga.poster} 
              alt={manga.title} 
              referrerPolicy="no-referrer"
              // 3. Logic làm mờ ảnh (blur-lg)
              className={`transition-all duration-300 ${isContentHidden ? 'blur-md scale-110' : 'blur-0 scale-100'}`}
            />
          </div>
        </div>

        {/* Tên truyện, chương mới, thể loại */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate group-hover:text-primary transition-colors" title={manga.title}>
            {manga.title}
          </h3>
          <p className="text-sm text-base-content/70 mt-1">
            {formatTimeAgo(manga.updatedAt)}
          </p>
          <div className="text-xs text-base-content/60 flex flex-wrap gap-x-2 gap-y-1 mt-2">
            {manga.genres?.slice(0, 3).map(genre => typeof genre !== 'string' && (
              <span key={genre._id}>{genre.name}</span>
            ))}
          </div>
        </div>
      </Link>
    </li>
  );
};


// Component chính, bây giờ nhận `mangas` làm prop
interface RankingSidebarProps {
  mangas: Manga[];
  title?: string;
}

const RankingSidebar = ({ mangas, title = "Bảng Xếp Hạng" }: RankingSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Lấy 10 truyện đầu tiên từ prop
  const rankingData = mangas.slice(0, 10);
  const itemsToShow = isExpanded ? rankingData.length : ITEMS_PER_PAGE;

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  // Xử lý trường hợp không có dữ liệu
  if (!mangas || mangas.length === 0) {
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body p-4">
          <h2 className="card-title text-lg">{title}</h2>
          <p>Không có dữ liệu để hiển thị.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-4">
        <h2 className="card-title text-lg border-l-4 border-primary pl-2 mb-4">
          {title}
        </h2>

        <ul className="space-y-2">
          {rankingData.slice(0, itemsToShow).map((manga, index) => (
            <RankingItem key={manga._id} manga={manga} rank={index + 1} />
          ))}
        </ul>

        <div className="card-actions justify-end mt-4">
          <button className="btn btn-sm btn-ghost" onClick={toggleExpansion}>
            {isExpanded ? 'Thu gọn ↑' : 'Xem tất cả →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankingSidebar;