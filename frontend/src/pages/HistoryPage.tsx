import { Link } from 'react-router-dom';
import { FiTrash2, FiClock, FiBookOpen } from 'react-icons/fi';
import { useHistoryStore } from '../store/useHistoryStore';
import { formatTimeAgo } from '../utils/dateFomat'; // Hàm format time của bạn
import { useEffect, useState } from 'react';

const HistoryPage = () => {
    // Lấy state và actions từ store
    const { history, removeFromHistory, clearHistory } = useHistoryStore();
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

    const handleClearAll = () => {
        if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử đọc truyện?")) {
            clearHistory();
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-base-300 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FiClock className="text-primary" /> 
                    Lịch Sử Đọc Truyện
                </h1>
                
                {history.length > 0 && (
                    <button 
                        onClick={handleClearAll}
                        className="btn btn-error btn-sm btn-outline gap-2"
                    >
                        <FiTrash2 /> Xóa tất cả
                    </button>
                )}
            </div>

            {/* Empty State */}
            {history.length === 0 ? (
                <div className="text-center py-20 bg-base-200 rounded-xl">
                    <FiBookOpen className="mx-auto text-6xl text-base-content/20 mb-4" />
                    <h3 className="text-xl font-semibold">Bạn chưa đọc truyện nào</h3>
                    <Link to="/" className="btn btn-primary mt-4">Khám phá ngay</Link>
                </div>
            ) : (
                /* List History */
                <div className="grid grid-cols-1 gap-4">
                    {history.map((item) => (
                        <div 
                            key={item.mangaId} 
                            className="flex bg-base-100 shadow-sm border border-base-200 rounded-lg p-3 hover:shadow-md transition-all group"
                        >
                            {/* Ảnh Poster */}
                            <Link to={`/manga/${item.mangaSlug}`} className="shrink-0">
                                <img 
                                    src={item.mangaPoster || '/place-doro.webp'} 
                                    alt={item.mangaTitle} 
                                    className={`w-16 h-24 object-cover rounded-md  ${isContentHidden ? 'blur-md ' :  'blur-0 '} `}
                                />
                            </Link>

                            {/* Thông tin */}
                            <div className="ml-4 flex-grow flex flex-col justify-between py-1">
                                <div>
                                    <Link 
                                        to={`/manga/${item.mangaSlug}`}
                                        className="font-bold text-lg leading-tight hover:text-primary transition-colors line-clamp-1"
                                    >
                                        {item.mangaTitle}
                                    </Link>
                                    
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-sm text-base-content/70">Đọc đến:</span>
                                        <Link 
                                            to={`/manga/${item.mangaSlug}/chapter/${item.chapterNumber}`}
                                            className="badge badge-primary badge-outline font-bold hover:bg-primary hover:text-white transition-colors"
                                        >
                                            {item.chapterNumber ===  1 ? `Oneshot` : `Chương ${item.chapterNumber}`}
                                        </Link>
                                    </div>
                                </div>

                                <div className="text-xs text-base-content/50 flex items-center gap-1 mt-2">
                                    <FiClock size={12} />
                                    {formatTimeAgo(new Date(item.readAt).toISOString())}
                                </div>
                            </div>

                            {/* Nút Xóa item */}
                            <div className="flex flex-col justify-center pl-2 border-l border-base-200 ml-2">
                                <button 
                                    onClick={() => removeFromHistory(item.mangaId)}
                                    className="btn btn-ghost btn-circle btn-sm text-error tooltip tooltip-left"
                                    data-tip="Xóa khỏi lịch sử"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;