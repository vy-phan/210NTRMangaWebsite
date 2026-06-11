import { useState, useEffect } from 'react';
import type { BannerInput } from '../../api/bannerApi';
import { FiImage, FiX, FiInfo } from 'react-icons/fi'; // Cần cài react-icons hoặc dùng text 'Img', 'X'

// === 1. KHAI BÁO DANH SÁCH ẢNH CÓ SẴN TRONG THƯ MỤC PUBLIC ===
// Bạn cập nhật list này khi thêm ảnh mới vào folder
const AVAILABLE_BANNERS = [
    '/banner/banner1.webp',
    '/banner/banner2.webp',
    '/banner/banner3.webp',
    '/banner/banner4.webp',
];

const AVAILABLE_CHARS = [
    '/banner/poster1.webp',
    '/banner/poster2.webp',
    '/banner/poster3.webp',
    '/banner/poster4.webp'
];

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: BannerInput) => void;
    initialData: Banner | null;
    mode: 'add' | 'edit';
}

const BannerModal = ({ isOpen, onClose, onSave, initialData, mode }: BannerModalProps) => {
    const [formData, setFormData] = useState<BannerInput>({
        title: '',
        bannerImg: '',
        charImg: '',
        link: '',
        active: true,
        priority: 0
    });

    // State quản lý việc mở hộp chọn ảnh
    const [showPicker, setShowPicker] = useState<{ type: 'banner' | 'char' | null }>({ type: null });

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setFormData({
                title: initialData.title,
                bannerImg: initialData.bannerImg,
                charImg: initialData.charImg,
                link: initialData.link,
                active: initialData.active,
                priority: initialData.priority || 0
            });
        } else {
            setFormData({ title: '', bannerImg: '', charImg: '', link: '', active: true, priority: 0 });
        }
        setShowPicker({ type: null }); // Reset picker khi mở modal
    }, [isOpen, mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleToggleActive = () => {
        setFormData(prev => ({ ...prev, active: !prev.active }));
    };

    // Hàm chọn ảnh từ Quick Picker
    const handleSelectImage = (field: 'bannerImg' | 'charImg', url: string) => {
        setFormData(prev => ({ ...prev, [field]: url }));
        setShowPicker({ type: null }); // Đóng picker sau khi chọn
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-2xl text-base-content">
                        {mode === 'add' ? 'Thêm Banner Mới' : 'Chỉnh Sửa Banner'}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hàng 1: Tên & Link (GIỮ NGUYÊN) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Tên Banner</span></label>
                            <input
                                type="text" name="title" required
                                value={formData.title} onChange={handleChange}
                                className="input input-bordered focus:input-primary"
                                placeholder="Ví dụ: Banner Solo Leveling..."
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Link điều hướng</span></label>
                            <input
                                type="text" name="link" required
                                value={formData.link} onChange={handleChange}
                                className="input input-bordered focus:input-primary"
                                placeholder="/manga/slug-truyen"
                            />
                        </div>
                    </div>

                    {/* Hàng 2: Priority & Active (GIỮ NGUYÊN) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Độ ưu tiên</span>
                            </label>
                            <input
                                type="number" name="priority"
                                value={formData.priority} onChange={handleChange}
                                className="input input-bordered focus:input-primary"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-4">
                                <span className="label-text font-semibold">Trạng thái hiển thị</span>
                                <input 
                                    type="checkbox" 
                                    className="toggle toggle-primary" 
                                    checked={formData.active} 
                                    onChange={handleToggleActive}
                                />
                                <span className="label-text-alt">{formData.active ? '(Đang hiện)' : '(Đang ẩn)'}</span>
                            </label>
                        </div>
                    </div>

                    {/* === HÀNG 3: URL ẢNH & PICKER (ĐÃ NÂNG CẤP) === */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* --- CỘT 1: ẢNH NỀN --- */}
                        <div className="space-y-2 relative">
                            <div className="form-control">
                                <label className="label flex justify-between">
                                    <span className="label-text font-semibold">URL Ảnh Nền</span>
                                    {/* Nút bật/tắt chọn nhanh */}
                                    <button 
                                        type="button" 
                                        className="btn btn-xs btn-outline btn-primary gap-1"
                                        onClick={() => setShowPicker(prev => ({ type: prev.type === 'banner' ? null : 'banner' }))}
                                    >
                                        <FiImage /> Chọn nhanh
                                    </button>
                                </label>
                                <div className="join w-full">
                                    <input
                                        type="text" 
                                        name="bannerImg" required
                                        value={formData.bannerImg} onChange={handleChange}
                                        className="input input-bordered focus:input-primary join-item w-full"
                                        placeholder="/banner/img.webp..."
                                    />
                                </div>
                            </div>

                            {/* QUICK PICKER CHO BANNER */}
                            {showPicker.type === 'banner' && (
                                <div className="absolute z-50 top-[80px] left-0 w-full bg-base-100 shadow-xl border border-base-300 rounded-box p-3 animate-fade-in-down">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold opacity-70">Chọn ảnh có sẵn:</span>
                                        <button type="button" onClick={() => setShowPicker({type: null})} className="btn btn-ghost btn-xs"><FiX/></button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                        {AVAILABLE_BANNERS.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSelectImage('bannerImg', img)}
                                                className={`relative group aspect-video rounded overflow-hidden border-2 ${formData.bannerImg === img ? 'border-primary' : 'border-transparent hover:border-base-content/50'}`}
                                            >
                                                <img src={img} alt="pick" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview Background */}
                            <div className="relative h-32 rounded-lg bg-base-300 overflow-hidden border border-base-content/20 mt-2">
                                {formData.bannerImg ? (
                                    <img src={formData.bannerImg} alt="Preview BG" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs opacity-50">Chưa có ảnh nền</div>
                                )}
                            </div>
                        </div>

                        {/* --- CỘT 2: ẢNH NHÂN VẬT --- */}
                        <div className="space-y-2 relative">
                            <div className="form-control">
                                <label className="label flex justify-between">
                                    <span className="label-text font-semibold">URL Ảnh Nhân Vật</span>
                                    <button 
                                        type="button" 
                                        className="btn btn-xs btn-outline btn-primary gap-1"
                                        onClick={() => setShowPicker(prev => ({ type: prev.type === 'char' ? null : 'char' }))}
                                    >
                                        <FiImage /> Chọn nhanh
                                    </button>
                                </label>
                                <input
                                    type="text" 
                                    name="charImg" required
                                    value={formData.charImg} onChange={handleChange}
                                    className="input input-bordered focus:input-primary w-full"
                                    placeholder="/banner/char.webp..."
                                />
                            </div>

                             {/* QUICK PICKER CHO CHAR */}
                             {showPicker.type === 'char' && (
                                <div className="absolute z-50 top-[80px] left-0 w-full bg-base-100 shadow-xl border border-base-300 rounded-box p-3 animate-fade-in-down">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold opacity-70">Chọn poster/char có sẵn:</span>
                                        <button type="button" onClick={() => setShowPicker({type: null})} className="btn btn-ghost btn-xs"><FiX/></button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                        {AVAILABLE_CHARS.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSelectImage('charImg', img)}
                                                className={`relative group aspect-[2/3] rounded overflow-hidden border-2 ${formData.charImg === img ? 'border-primary' : 'border-transparent hover:border-base-content/50'}`}
                                            >
                                                <img src={img} alt="pick" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preview Character */}
                            <div className="relative h-32 rounded-lg bg-base-300 overflow-hidden border border-base-content/20 flex justify-center mt-2">
                                {formData.charImg ? (
                                    <img src={formData.charImg} alt="Preview Char" className="h-full object-contain" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs opacity-50">Chưa có ảnh nhân vật</div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Gợi ý Upload ảnh */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <FiInfo size={22} />
                        </div>
                        <div className="text-sm text-base-content/80">
                            <span className="font-bold text-primary block mb-1">Lưu ý:</span>
                            Bạn có thể đăng ảnh lên <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" className="link link-primary font-bold">Imgur</a>, sau đó copy đường link ảnh và dán vào các ô URL ở trên.
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn btn-primary">
                            {mode === 'add' ? 'Thêm Banner' : 'Cập Nhật'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
};

export default BannerModal;