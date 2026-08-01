import { Link } from 'react-router-dom';
import { FiTrash2, FiClock, FiBookOpen, FiPlayCircle, FiArrowRight } from 'react-icons/fi';
import { useHistoryStore } from '../store/useHistoryStore';
import { formatTimeAgo } from '../utils/dateFomat';
import { useContentHidden } from '../context/ContentHiddenContext';

const HistoryPage = () => {
    // Giữ nguyên logic lấy state và actions
    const { history, removeFromHistory, clearHistory } = useHistoryStore();
    const { isContentHidden } = useContentHidden();

    const handleClearAll = () => {
        if (window.confirm("Bạn có chắc muốn xóa toàn bộ lịch sử đọc truyện?")) {
            clearHistory();
        }
    };

    return (
        <div className="min-h-screen bg-base-200/50">
            <div className="container mx-auto p-4 md:p-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-4 border-b border-base-300 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 text-base-content">
                            <FiClock className="text-primary" />
                            Lịch Sử Đọc
                        </h1>
                        <p className="text-base-content/60 mt-2">
                            Bạn đã đọc <span className="font-bold text-primary">{history.length}</span> truyện.
                        </p>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="btn btn-outline btn-error btn-sm gap-2 hover:shadow-lg transition-all"
                        >
                            <FiTrash2 /> Xóa tất cả
                        </button>
                    )}
                </div>

                {/* Empty State */}
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-base-100 rounded-3xl shadow-sm border border-base-200 text-center">
                        <div className="bg-base-200 p-6 rounded-full mb-6">
                            <FiBookOpen className="text-6xl text-base-content/30" />
                        </div>
                        <h3 className="text-2xl font-bold text-base-content">Bạn chưa đọc truyện nào</h3>
                        <p className="text-base-content/60 mt-2 max-w-md">
                            Hãy bắt đầu khám phá kho truyện khổng lồ và quay lại đây để xem lịch sử nhé!
                        </p>
                        <Link to="/" className="btn btn-primary btn-wide mt-8 shadow-lg shadow-primary/30 rounded-full">
                            Khám phá ngay <FiArrowRight />
                        </Link>
                    </div>
                ) : (
                    /* List History - Chuyển sang Grid 2 cột trên PC */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {history.map((item) => (
                            <div
                                key={item.mangaId}
                                className="group relative flex bg-base-100 rounded-2xl p-3 shadow-sm border border-transparent hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Ảnh Poster với Wrapper */}
                                <Link to={`/manga/${item.mangaSlug}`} className="shrink-0 relative overflow-hidden rounded-xl w-24 md:w-28 aspect-[2/3]">
                                    <img
                                        src={item.mangaPoster || '/place-doro.webp'}
                                        alt={item.mangaTitle}
                                        className={`
                                            w-full h-full object-cover transition-transform duration-500 group-hover:scale-110
                                            ${isContentHidden ? 'blur-md scale-105' : 'blur-0'}
                                        `}
                                    />
                                    {/* Overlay Play Icon khi hover */}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <FiBookOpen className="text-white text-2xl drop-shadow-md" />
                                    </div>
                                </Link>

                                {/* Thông tin */}
                                <div className="ml-4 flex-grow flex flex-col py-1 min-w-0">
                                    {/* Title */}
                                    <div className="mb-auto">
                                        <Link
                                            to={`/manga/${item.mangaSlug}`}
                                            className="font-bold text-lg md:text-xl leading-tight text-base-content hover:text-primary transition-colors line-clamp-2"
                                            title={item.mangaTitle}
                                        >
                                            {item.mangaTitle}
                                        </Link>

                                        <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-base-content/50">
                                            <FiClock />
                                            <span>{formatTimeAgo(new Date(item.readAt).toISOString())}</span>
                                        </div>
                                    </div>

                                    {/* Action Row */}
                                    <div className="flex items-center justify-between mt-3 gap-3">
                                        <Link
                                            to={`/manga/${item.mangaSlug}/chapter/${item.chapterNumber}`}
                                            className="btn btn-sm btn-primary btn-outline gap-2 rounded-lg flex-grow md:flex-grow-0 group-hover:bg-primary group-hover:text-white transition-all"
                                        >
                                            <FiPlayCircle className="w-4 h-4" />
                                            <span className="truncate max-w-[120px]">
                                                {/* Logic: Nếu title chứa bất kỳ chữ cái nào (a-z, A-Z) -> Hiển thị gốc */}
                                                {/* Nếu không có chữ cái (chỉ có số, dấu chấm, dấu gạch ngang) -> Thêm "Chương" */}
                                                {/[a-zA-Z]/.test(item.chapterTitle)
                                                    ? item.chapterTitle
                                                    : `Chương ${item.chapterTitle}`
                                                }
                                            </span>
                                        </Link>

                                        {/* Nút Xóa (Mobile: Icon nhỏ, PC: Icon rõ ràng hơn) */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault(); // Tránh click nhầm vào card
                                                removeFromHistory(item.mangaId);
                                            }}
                                            className="btn btn-sm btn-ghost btn-square text-base-content/40 hover:text-error hover:bg-error/10 transition-colors"
                                            title="Xóa khỏi lịch sử"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;