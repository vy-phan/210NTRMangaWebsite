import { useState, useMemo } from 'react';
import { FiDownload, FiX, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { getChapterByNumberAPI } from '../../api/chapterApi';
import { saveChapterOffline, checkChapterSaved } from '../../utils/offlineDB';

interface BulkDownloadButtonProps {
    slug: string;
    chapters: Chapter[]; // Danh sách chapter đã sort (thường là mới nhất -> cũ nhất)
}

const BulkDownloadButton = ({ slug, chapters }: BulkDownloadButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Sort chapters từ cũ -> mới để hiển thị trong select cho xuôi
    const sortedChaptersAsc = useMemo(() => {
        return [...chapters].sort((a, b) => a.number - b.number);
    }, [chapters]);

    const [startId, setStartId] = useState<string>('');
    const [endId, setEndId] = useState<string>('');

    // State xử lý download
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, successes: 0, failures: 0 });
    const [currentDownloadingTitle, setCurrentDownloadingTitle] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const openModal = () => {
        if (chapters.length > 0) {
            // Mặc định chọn tất cả: Từ chương đầu tiên đến chương cuối cùng
            setStartId(sortedChaptersAsc[0]._id);
            setEndId(sortedChaptersAsc[sortedChaptersAsc.length - 1]._id);
        }
        setIsOpen(true);
        setLogs([]);
        setProgress({ current: 0, total: 0, successes: 0, failures: 0 });
    };

    const closeModal = () => {
        if (isDownloading) {
            if (!window.confirm('Đang tải, bạn có chắc muốn hủy và đóng không?')) return;
        }
        setIsOpen(false);
        setIsDownloading(false);
    };

    const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), msg]);

    const handleBulkDownload = async () => {
        // 1. Xác định range
        const startIndex = sortedChaptersAsc.findIndex(c => c._id === startId);
        const endIndex = sortedChaptersAsc.findIndex(c => c._id === endId);

        if (startIndex === -1 || endIndex === -1) {
            toast.error("Vui lòng chọn chương hợp lệ");
            return;
        }

        // Đảm bảo start <= end
        const actualStart = Math.min(startIndex, endIndex);
        const actualEnd = Math.max(startIndex, endIndex);

        const chaptersToDownload = sortedChaptersAsc.slice(actualStart, actualEnd + 1);

        if (chaptersToDownload.length === 0) return;

        setIsDownloading(true);
        setProgress({ current: 0, total: chaptersToDownload.length, successes: 0, failures: 0 });
        setLogs([]);

        // 2. Loop download
        // Xử lý tuần tự để tránh nghẽn mạng/API
        for (let i = 0; i < chaptersToDownload.length; i++) {
            const chapter = chaptersToDownload[i];
            setCurrentDownloadingTitle(chapter.title);
            setProgress(prev => ({ ...prev, current: i + 1 }));
            addLog(`Đang xử lý: Chương ${chapter.title}...`);

            try {
                // Check đã lưu chưa để skip (tuỳ nhu cầu, ở đây check cho tối ưu)
                const isSaved = await checkChapterSaved(slug, chapter.number);
                if (isSaved) {
                    addLog(`-> Đã có sẵn: Chương ${chapter.title} (Skip)`);
                    setProgress(prev => ({ ...prev, successes: prev.successes + 1 }));
                    continue;
                }

                // Gọi API lấy ảnh
                const { chapter: fullData } = await getChapterByNumberAPI(slug, chapter.number);

                if (!fullData?.images?.length) {
                    throw new Error("Không có ảnh");
                }

                // Lưu offline
                await saveChapterOffline(slug, chapter.number, fullData);

                addLog(`-> Thành công: Chương ${chapter.title}`);
                setProgress(prev => ({ ...prev, successes: prev.successes + 1 }));

            } catch (error) {
                console.error(error);
                addLog(`-> Thất bại: Chương ${chapter.title}`);
                setProgress(prev => ({ ...prev, failures: prev.failures + 1 }));
            }
        }

        setIsDownloading(false);
        toast.success("Hoàn tất quá trình tải!");
    };

    if (chapters.length === 0) return null;

    return (
        <>
            <button
                onClick={openModal}
                className="btn btn-outline btn-primary btn-md gap-2"
                title="Tải nhiều chương cùng lúc"
            >
                <FiDownload /> Tải nhiều
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-base-200">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <FiDownload /> Tải hàng loạt
                            </h3>
                            <button onClick={closeModal} className="btn btn-sm btn-ghost btn-circle">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-4 overflow-y-auto flex-1">
                            {!isDownloading ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-medium">Từ chương</span></label>
                                            <select
                                                className="select select-bordered select-sm w-full"
                                                value={startId}
                                                onChange={(e) => setStartId(e.target.value)}
                                            >
                                                {sortedChaptersAsc.map(c => (
                                                    <option key={c._id} value={c._id}>Chương {c.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-control">
                                            <label className="label"><span className="label-text font-medium">Đến chương</span></label>
                                            <select
                                                className="select select-bordered select-sm w-full"
                                                value={endId}
                                                onChange={(e) => setEndId(e.target.value)}
                                            >
                                                {sortedChaptersAsc.map(c => (
                                                    <option key={c._id} value={c._id}>Chương {c.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-base-200 rounded-lg text-sm text-base-content/70">
                                        <p><FiAlertCircle className="inline mr-1" /> Lưu ý:</p>
                                        <ul className="list-disc list-inside pl-1 text-xs mt-1 space-y-1">
                                            <li>Quá trình tải cần mạng ổn định.</li>
                                            <li>Vui lòng giữ màn hình sáng khi đang tải.</li>
                                            <li>Dữ liệu sẽ được lưu vào bộ nhớ trình duyệt.</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 py-4">
                                    <div className="text-center">
                                        <div className="radial-progress text-primary font-bold text-lg transition-all" style={{ "--value": (progress.current / progress.total) * 100, "--size": "5rem" } as any}>
                                            {Math.round((progress.current / progress.total) * 100)}%
                                        </div>
                                        <p className="mt-2 text-sm font-medium animate-pulse">
                                            Đang tải chương {currentDownloadingTitle}...
                                        </p>
                                        <p className="text-xs text-base-content/50">
                                            {progress.current} / {progress.total}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs px-1">
                                            <span className="text-success flex items-center gap-1"><FiCheckCircle /> Thành công: {progress.successes}</span>
                                            <span className="text-error flex items-center gap-1"><FiAlertCircle /> Lỗi: {progress.failures}</span>
                                        </div>
                                        <div className="w-full bg-base-200 rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="mockup-code bg-neutral text-neutral-content h-32 text-[10px] overflow-y-auto custom-scrollbar p-2 block">
                                        {logs.map((log, idx) => (
                                            <div key={idx} className="truncate">{log}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-base-200 bg-base-100 rounded-b-xl sticky bottom-0">
                            {!isDownloading ? (
                                <button
                                    onClick={handleBulkDownload}
                                    className="btn btn-primary w-full"
                                >
                                    <FiDownload /> Bắt đầu tải
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="btn btn-disabled w-full"
                                >
                                    <FiLoader className="animate-spin" /> Đang xử lý...
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BulkDownloadButton;
