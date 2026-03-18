import { useState, useEffect, useMemo } from 'react';
import { getAllMangasAPI } from '../../api/mangaApi';
import { type Promotion } from '../../api/promotionApi';
import { FiSearch, FiCheck, FiX, FiLink, FiImage, FiType, FiEye, FiHash } from 'react-icons/fi';

interface PromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Promotion>) => void;
    initialData: Promotion | null;
    mode: 'add' | 'edit';
}

const PromotionModal = ({ isOpen, onClose, onSave, initialData, mode }: PromotionModalProps) => {
    const [formData, setFormData] = useState<Partial<Promotion>>({
        title: '',
        image: '',
        link: '',
        views: '0',
        active: true,
        priority: 0
    });

    const [allMangas, setAllMangas] = useState<Manga[]>([]);
    const [mangaSearch, setMangaSearch] = useState('');
    const [isLoadingMangas, setIsLoadingMangas] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchMangas = async () => {
                try {
                    setIsLoadingMangas(true);
                    const data = await getAllMangasAPI();
                    setAllMangas(data);
                } catch (error) {
                    console.error("Failed to fetch mangas", error);
                } finally {
                    setIsLoadingMangas(false);
                }
            };
            fetchMangas();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setFormData({
                title: initialData.title,
                image: initialData.image,
                link: initialData.link,
                views: initialData.views || '0',
                active: initialData.active,
                priority: initialData.priority
            });
        } else if (isOpen && mode === 'add') {
            setFormData({
                title: '',
                image: '',
                link: '',
                views: '0',
                active: true,
                priority: 0
            });
        }
    }, [isOpen, mode, initialData]);

    const filteredMangas = useMemo(() => {
        return allMangas.filter(m => 
            m.title.toLowerCase().includes(mangaSearch.toLowerCase()) ||
            m.slug.toLowerCase().includes(mangaSearch.toLowerCase())
        ).slice(0, 5); // Only show top 5 results for speed
    }, [allMangas, mangaSearch]);

    const handleSelectManga = (manga: Manga) => {
        setFormData(prev => ({
            ...prev,
            title: manga.title,
            image: manga.poster || '',
            link: manga.slug,
        }));
        setMangaSearch(''); // Clear search after selection
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
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
                    <h3 className="font-bold text-2xl">
                        {mode === 'add' ? 'Thêm UI Promotion' : 'Chỉnh Sửa Promotion'}
                    </h3>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost"><FiX /></button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Auto-fill Search */}
                    <div className="lg:col-span-5 bg-base-200/50 p-4 rounded-xl border border-base-300">
                        <label className="label font-bold text-sm uppercase opacity-60">Chọn từ Truyện (Tự điền)</label>
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none opacity-50">
                                <FiSearch />
                            </div>
                            <input
                                type="text"
                                className="input input-bordered w-full pl-10"
                                placeholder="Tìm tên truyện..."
                                value={mangaSearch}
                                onChange={(e) => setMangaSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            {isLoadingMangas ? (
                                <div className="flex justify-center py-4"><span className="loading loading-spinner loading-md"></span></div>
                            ) : mangaSearch && filteredMangas.length > 0 ? (
                                filteredMangas.map(m => (
                                    <button
                                        key={m._id}
                                        onClick={() => handleSelectManga(m)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-base-300 transition-colors text-left border border-transparent hover:border-primary/30"
                                    >
                                        <img src={m.poster} className="w-10 h-14 object-cover rounded" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{m.title}</p>
                                            <p className="text-xs opacity-50">Slug: {m.slug}</p>
                                        </div>
                                        <FiCheck className="text-primary opacity-0 group-hover:opacity-100" />
                                    </button>
                                ))
                            ) : mangaSearch ? (
                                <p className="text-center py-4 text-xs opacity-50 italic">Không tìm thấy truyện nào</p>
                            ) : (
                                <p className="text-center py-4 text-xs opacity-40">Nhập tên để tự động lấy dữ liệu</p>
                            )}
                        </div>

                        {/* Preview UI */}
                        {formData.image && (
                            <div className="mt-8">
                                <label className="label font-bold text-sm uppercase opacity-60 mb-2">Preview Hình ảnh</label>
                                <div className="relative overflow-hidden rounded-lg shadow-xl aspect-square w-32">
                                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Form Data */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2"><FiType /> Tiêu đề hiển thị</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="input input-bordered focus:input-primary"
                                    placeholder="Ví dụ: Hagure Mate"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2"><FiImage /> Hình ảnh (URL)</span>
                                </label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    required
                                    className="input input-bordered focus:input-primary"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2"><FiLink /> Đường dẫn (Link/Slug)</span>
                                </label>
                                <input
                                    type="text"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    required
                                    className="input input-bordered focus:input-primary"
                                    placeholder="slug-truyen-123"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold flex items-center gap-2"><FiEye /> Lượt xem giả lập</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="views"
                                        value={formData.views}
                                        onChange={handleChange}
                                        className="input input-bordered"
                                        placeholder="1.8K"
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label cursor-pointer justify-start gap-3 h-full pt-10">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={formData.active}
                                            onChange={handleChange}
                                            className="checkbox checkbox-primary"
                                        />
                                        <span className="label-text font-semibold">Kích hoạt</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-control max-w-[200px]">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2"><FiHash /> Độ ưu tiên</span>
                                </label>
                                <input
                                    type="number"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="input input-bordered"
                                />
                            </div>

                            <div className="modal-action border-t pt-4 mt-6">
                                <button type="button" onClick={onClose} className="btn btn-ghost">Hủy</button>
                                <button type="submit" className="btn btn-primary px-8">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
};

export default PromotionModal;
