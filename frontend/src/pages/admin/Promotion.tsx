import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiMonitor, FiTrendingUp } from 'react-icons/fi';
import { 
    getPromotionsAPI, 
    createPromotionAPI, 
    updatePromotionAPI, 
    deletePromotionAPI, 
    type Promotion 
} from '../../api/promotionApi';
import PromotionModal from '../../components/admin/PromotionModal';

const PromotionAdmin = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                setIsLoading(true);
                const data = await getPromotionsAPI();
                setPromotions(data);
            } catch (err) {
                setError('Không thể tải danh sách UI elements.');
                toast.error('Lỗi khi tải dữ liệu!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    const filteredPromotions = promotions;

    const handleOpenAddModal = () => {
        setEditingPromotion(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (promo: Promotion) => {
        setEditingPromotion(promo);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleSavePromotion = async (promoData: Partial<Promotion>) => {
        const apiCall = modalMode === 'add'
            ? createPromotionAPI(promoData)
            : updatePromotionAPI(editingPromotion!._id, promoData);

        toast.promise(apiCall, {
            loading: 'Đang lưu cấu hình UI...',
            success: (result) => {
                if (modalMode === 'add') {
                    setPromotions(prev => [result, ...prev]);
                } else {
                    setPromotions(prev => prev.map(p => p._id === result._id ? result : p));
                }
                setIsModalOpen(false);
                return 'Lưu thành công!';
            },
            error: 'Lỗi khi lưu.',
        });
    };

    const handleDeletePromotion = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa UI element này?')) {
            toast.promise(deletePromotionAPI(id), {
                loading: 'Đang xóa...',
                success: () => {
                    setPromotions(prev => prev.filter(p => p._id !== id));
                    return 'Đã xóa!';
                },
                error: 'Lỗi khi xóa.',
            });
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-96"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div role="alert" className="alert alert-error"><span>{error}</span></div>;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý UI Promotion</h1>
                    <p className="text-base-content/70 mt-1">Quản lý nội dung Trending và Banners phụ của trang chủ.</p>
                </div>
                <button className="btn btn-primary shadow-lg" onClick={handleOpenAddModal}>
                    <FiPlus /> Thêm UI Element
                </button>
            </header>


            {filteredPromotions.length === 0 ? (
                <div className="text-center py-24 bg-base-200/50 border-2 border-dashed border-base-300 rounded-[2rem] transition-all hover:bg-base-200/80">
                    <div className="flex flex-col items-center opacity-30">
                        <FiMonitor size={80} className="mb-6 text-primary" />
                        <h2 className="text-2xl font-black uppercase tracking-widest">Trống trải</h2>
                        <p className="mt-3 font-medium">Hãy nhấn nút "Thêm" để bắt đầu tùy chỉnh giao diện.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredPromotions.map(promo => (
                        <div key={promo._id} className="group relative bg-base-100 rounded-2xl md:rounded-3xl overflow-hidden border border-base-300 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col h-full">
                            {/* Image Header */}
                            <div className="relative aspect-[3/4] md:aspect-[2/3] overflow-hidden">
                                <img 
                                    src={promo.image} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    alt={promo.title} 
                                />
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                {/* Status Badge (Top Right) */}
                                <div className="absolute top-2 right-2 md:top-3 md:right-3">
                                    <div className={`badge badge-sm md:badge-md border-none px-2 md:px-3 py-3 md:py-4 font-black shadow-lg ${promo.active ? 'bg-success text-success-content' : 'bg-base-300 text-base-content/50'}`}>
                                        {promo.active ? 'ACTIVE' : 'HIDDEN'}
                                    </div>
                                </div>

                                {/* Views (Bottom Left) */}
                                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 flex items-center gap-1.5 text-white/90 text-[10px] md:text-sm font-bold bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                    <FiTrendingUp className="text-secondary animate-pulse" />
                                    <span>{promo.views || '0'}</span>
                                </div>

                                {/* Priority (Top Left) */}
                                <div className="absolute top-2 left-2 md:top-3 md:left-3">
                                    <div className="bg-primary/90 backdrop-blur-md text-primary-content text-[10px] md:text-xs font-black px-2 py-1 rounded-lg shadow-xl border border-white/10 uppercase tracking-tighter">
                                        Prio: {promo.priority}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3 md:p-5 flex flex-col flex-1 justify-between gap-3">
                                <div className="space-y-1">
                                    <h2 className="text-sm md:text-lg font-black leading-tight line-clamp-2 md:line-clamp-1 group-hover:text-primary transition-colors">
                                        {promo.title}
                                    </h2>
                                    <p className="text-[10px] md:text-xs opacity-40 font-mono truncate">
                                        {promo.link}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-base-200">
                                    <span className="text-[10px] md:text-[11px] font-bold opacity-30 uppercase tracking-widest hidden md:block">
                                        Actions
                                    </span>
                                    <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto justify-end">
                                        <button 
                                            onClick={() => handleOpenEditModal(promo)} 
                                            className="btn btn-ghost btn-xs md:btn-sm btn-circle text-info hover:bg-info/20 transition-all border border-transparent hover:border-info/30"
                                        >
                                            <FiEdit className="size-3.5 md:size-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeletePromotion(promo._id)} 
                                            className="btn btn-ghost btn-xs md:btn-sm btn-circle text-error hover:bg-error/20 transition-all border border-transparent hover:border-error/30"
                                        >
                                            <FiTrash2 className="size-3.5 md:size-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-2xl md:rounded-3xl pointer-events-none transition-all duration-500"></div>
                        </div>
                    ))}
                </div>
            )}

            <PromotionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSavePromotion}
                initialData={editingPromotion}
                mode={modalMode}
            />
        </div>
    );
};

export default PromotionAdmin;
