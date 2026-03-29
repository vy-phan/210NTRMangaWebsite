import { useState } from 'react';
import { FiFlag, FiAlertCircle, FiX } from 'react-icons/fi';
import { createReportAPI } from '../../api/chapterReportApi';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';

interface ReportChapterModalProps {
    mangaId: string;
    chapterId: string;
    chapterNumber: number;
}

const ReportChapterModal = ({ mangaId, chapterId, chapterNumber }: ReportChapterModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorType, setErrorType] = useState<ErrorType>('image_broken');
    const [description, setDescription] = useState('');
    const { user } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            toast.error("Vui lòng mô tả chi tiết lỗi.");
            return;
        }

        try {
            setIsSubmitting(true);
            await createReportAPI({
                mangaId,
                chapterId,
                reporter: user?._id || null,
                errorType,
                description
            });
            toast.success("Đã gửi báo cáo lỗi. Cảm ơn bạn!");
            setIsOpen(false);
            setDescription('');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || "Gửi báo cáo thất bại.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Nút kích hoạt */}
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error/10 hover:bg-error/20 text-error text-xs font-bold transition-all duration-300 border border-error/20"
            >
                <FiFlag size={14} />
                Báo cáo lỗi chương
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)}>
                    <div 
                        className="bg-base-100 w-full max-w-md rounded-2xl shadow-2xl border border-base-300 overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-base-300 flex justify-between items-center bg-base-200/50">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FiAlertCircle className="text-error" /> Báo cáo lỗi Chương {chapterNumber}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-sm btn-circle">
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold">Loại lỗi:</span>
                                </label>
                                <select 
                                    className="select select-bordered w-full"
                                    value={errorType}
                                    onChange={(e) => setErrorType(e.target.value as ErrorType)}
                                >
                                    <option value="image_broken">Lỗi ảnh (Không load, lỗi link)</option>
                                    <option value="wrong_order">Sai thứ tự trang</option>
                                    <option value="missing_pages">Thiếu trang</option>
                                    <option value="wrong_manga">Nhầm truyện/Nhầm chương</option>
                                    <option value="other">Lỗi khác</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold">Mô tả chi tiết:</span>
                                </label>
                                <textarea 
                                    className="textarea textarea-bordered h-24" 
                                    placeholder="Ví dụ: Trang số 5 bị trắng xóa, không xem được ảnh..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="p-3 bg-info/10 text-info text-[11px] rounded-lg">
                                Góp ý của bạn sẽ giúp Admin phát hiện và xử lý lỗi nhanh chóng hơn. Trân trọng!
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    type="button" 
                                    className="btn flex-1" 
                                    onClick={() => setIsOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-error flex-1 text-white"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <span className="loading loading-spinner"></span> : "Gửi báo cáo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportChapterModal;
