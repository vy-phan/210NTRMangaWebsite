import { useState, useEffect } from 'react';
import { FiDownload, FiCheck, FiLoader } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { saveChapterOffline, checkChapterSaved, deleteChapterOffline } from '../../utils/offlineDB';
import { getChapterByNumberAPI } from '../../api/chapterApi';

interface ChapterListDownloadButtonProps {
    slug: string;
    chapter: Chapter; // Object chapter từ list
}

const ChapterListDownloadButton = ({ slug, chapter }: ChapterListDownloadButtonProps) => {
    const [isSaved, setIsSaved] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Index dùng để gọi API thường là number - 1 (nếu backend tính từ 0)
    // Hoặc giữ nguyên tùy logic backend của bạn. Ở đây giả định API nhận index từ 0.
    const chapterIndex = chapter.number; 

    // Kiểm tra trạng thái khi load
    useEffect(() => {
        const checkStatus = async () => {
            const saved = await checkChapterSaved(slug, chapterIndex);
            setIsSaved(saved);
        };
        checkStatus();
    }, [slug, chapterIndex]);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault(); // Ngăn chặn nhảy trang khi nút nằm gần thẻ Link
        e.stopPropagation();

        setIsDownloading(true);
        // Toast ID để cập nhật trạng thái
        const toastId = toast.loading(`Đang lấy dữ liệu chương ${chapter.title}...`);

        try {
            // 1. Gọi API lấy chi tiết chương (để lấy danh sách ảnh)
            const { chapter: fullChapterData } = await getChapterByNumberAPI(slug, chapterIndex);

            if (!fullChapterData || !fullChapterData.images || fullChapterData.images.length === 0) {
                throw new Error("Không tìm thấy ảnh trong chương này");
            }

            // 2. Lưu vào Offline DB
            toast.loading(`Đang tải ${fullChapterData.images.length} trang ảnh...`, { id: toastId });
            await saveChapterOffline(slug, chapterIndex, fullChapterData);
            
            setIsSaved(true);
            toast.success("Tải xong! Sẵn sàng đọc offline.", { id: toastId });

        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải xuống. Kiểm tra mạng!", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (window.confirm(`Xóa bản offline chương ${chapter.title}?`)) {
            await deleteChapterOffline(slug, chapterIndex);
            setIsSaved(false);
            toast.success("Đã xóa bản lưu.");
        }
    };

    if (isDownloading) {
        return (
            <button className="btn btn-ghost btn-sm btn-circle text-info" disabled>
                <FiLoader className="animate-spin" />
            </button>
        );
    }

    if (isSaved) {
        return (
            <div className="tooltip tooltip-left" data-tip="Đã tải (Nhấn để xóa)">
                <button onClick={handleDelete} className="btn btn-ghost btn-sm btn-circle text-success">
                    <FiCheck />
                </button>
            </div>
        );
    }

    return (
        <div className="tooltip tooltip-left" data-tip="Tải xuống">
            <button onClick={handleDownload} className="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-primary">
                <FiDownload />
            </button>
        </div>
    );
};

export default ChapterListDownloadButton;