import { useState, useEffect } from 'react';
import type { BannerInput } from '../../api/bannerApi';


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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-2xl text-base-content">
                        {mode === 'add' ? 'Thêm Banner Mới' : 'Chỉnh Sửa Banner'}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hàng 1: Tên & Link */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold">Tên Banner (Ghi chú)</span></label>
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

                    {/* Hàng 2: Priority & Active */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Độ ưu tiên (Số càng lớn hiện càng đầu)</span>
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

                    {/* Hàng 3: URL Ảnh & Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ảnh nền */}
                        <div className="space-y-2">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">URL Ảnh Nền (Background)</span></label>
                                <input
                                    type="text" 
                                    name="bannerImg" required
                                    value={formData.bannerImg} onChange={handleChange}
                                    className="input input-bordered focus:input-primary"
                                    placeholder="/banner/img.webp hoặc https://..."
                                />
                            </div>
                            {/* Preview Background */}
                            <div className="relative h-32 rounded-lg bg-base-300 overflow-hidden border border-base-content/20">
                                {formData.bannerImg ? (
                                    <img src={formData.bannerImg} alt="Preview BG" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs opacity-50">Chưa có ảnh nền</div>
                                )}
                            </div>
                        </div>

                        {/* Ảnh nhân vật */}
                        <div className="space-y-2">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-semibold">URL Ảnh Nhân Vật (PNG Transparent)</span></label>
                                <input
                                    type="text" 
                                    name="charImg" required
                                    value={formData.charImg} onChange={handleChange}
                                    className="input input-bordered focus:input-primary"
                                    placeholder="/banner/char.webp hoặc https://..."
                                />
                            </div>
                            {/* Preview Character */}
                            <div className="relative h-32 rounded-lg bg-base-300 overflow-hidden border border-base-content/20 flex justify-center">
                                {formData.charImg ? (
                                    <img src={formData.charImg} alt="Preview Char" className="h-full object-contain" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs opacity-50">Chưa có ảnh nhân vật</div>
                                )}
                            </div>
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