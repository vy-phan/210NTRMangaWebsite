import { useState, useRef } from 'react';
import { FiShare2, FiCopy, FiCheck, FiX } from 'react-icons/fi';
import QRCode from 'react-qr-code';
import { toast } from 'react-hot-toast';

const ShareChapterModal = () => {
    const modalRef = useRef<HTMLDialogElement>(null);
    const [copied, setCopied] = useState(false);
    
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleOpenModal = () => {
        modalRef.current?.showModal();
        setCopied(false); 
    };

    const handleCloseModal = () => {
        modalRef.current?.close();
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            toast.success("Đã sao chép liên kết!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Không thể sao chép liên kết.");
        }
    };

    return (
        <>
            {/* Nút kích hoạt Modal */}
            <button 
                onClick={handleOpenModal} 
                className="btn btn-outline btn-ghost gap-2"
                title="Chia sẻ chương này"
            >
                <FiShare2 className="w-5 h-5" />
                <span className="hidden sm:inline">Chia sẻ</span>
            </button>

            {/* Modal DaisyUI */}
            <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Chia sẻ Chương truyện</h3>
                        <button onClick={handleCloseModal} className="btn btn-sm btn-circle btn-ghost">
                            <FiX />
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        
                        {/* Phần 1: Copy Link */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold">Sao chép liên kết</span>
                            </label>
                            <div className="join w-full">
                                <input 
                                    type="text" 
                                    value={currentUrl} 
                                    readOnly 
                                    className="input input-bordered join-item w-full text-sm bg-base-200" 
                                />
                                <button 
                                    onClick={handleCopyLink} 
                                    className={`btn join-item ${copied ? 'btn-success text-white' : 'btn-primary'}`}
                                >
                                    {copied ? <FiCheck /> : <FiCopy />}
                                    {copied ? 'Đã chép' : 'Sao chép'}
                                </button>
                            </div>
                        </div>

                        <div className="divider my-0">HOẶC</div>

                        {/* Phần 2: QR Code */}
                        <div className="flex flex-col items-center gap-3">
                            <span className="font-semibold text-sm">Quét mã QR để đọc trên điện thoại</span>
                            <div className="bg-white p-4 rounded-xl shadow-inner">
                                <QRCode 
                                    value={currentUrl} 
                                    size={180}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                            <p className="text-xs text-base-content/60 text-center max-w-xs">
                                Sử dụng Camera hoặc Zalo để quét mã và truy cập ngay lập tức.
                            </p>
                        </div>
                    </div>
                </div>
                
                {/* Click backdrop để đóng */}
                <form method="dialog" className="modal-backdrop">
                    <button onClick={handleCloseModal}>close</button>
                </form>
            </dialog>
        </>
    );
};

export default ShareChapterModal;