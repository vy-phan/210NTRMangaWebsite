import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiMonitor, FiTrendingUp, FiSearch, FiLink, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import {
    getPromotionsAPI,
    createPromotionAPI,
    updatePromotionAPI,
    deletePromotionAPI
} from '../../api/promotionApi';
import PromotionModal from '../../components/admin/PromotionModal';

const PromotionAdmin = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredPromotions = promotions.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.link.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            loading: 'Đang lưu cấu hình...',
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
        if (window.confirm('Bạn có chắc chắn muốn xóa mục đề cử này?')) {
            toast.promise(deletePromotionAPI(id), {
                loading: 'Đang xóa...',
                success: () => {
                    setPromotions(prev => prev.filter(p => p._id !== id));
                    return 'Đã xóa thành công!';
                },
                error: 'Lỗi khi xóa.',
            });
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-96"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div role="alert" className="alert alert-error"><span>{error}</span></div>;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Truyện Đề Cử</h1>
                    <p className="text-base-content/70 mt-1">Tổng cộng: {filteredPromotions.length} / {promotions.length} mục.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn btn-primary btn-md shadow-lg" onClick={handleOpenAddModal}>
                        <FiPlus /> Thêm Đề Cử
                    </button>
                </div>
            </header>

            <div className="form-control">
                <label className="input input-bordered flex items-center gap-2">
                    <FiSearch className="text-base-content/50" />
                    <input
                        type="text"
                        className="grow"
                        placeholder="Tìm theo tiêu đề hoặc link..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </label>
            </div>

            {filteredPromotions.length === 0 ? (
                <div className="text-center py-24 bg-base-200/50 border-2 border-dashed border-base-300 rounded-[2rem]">
                    <FiMonitor className="mx-auto text-5xl text-base-content/30 mb-4" />
                    <h2 className="text-xl font-semibold">Trống trải</h2>
                    <p className="text-base-content/60 mt-2">Hãy nhấn nút "Thêm Đề Cử" để bắt đầu tùy chỉnh.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-base-100 rounded-box shadow-lg border border-base-200">
                    <table className="table w-full">
                        <thead className="text-base bg-base-300">
                            <tr>
                                <th className="w-24">Hình ảnh</th>
                                <th>Tiêu đề & Đường dẫn</th>
                                <th className="text-center">Độ ưu tiên</th>
                                <th className="text-center">Lượt xem</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPromotions.sort((a,b) => b.priority - a.priority).map(promo => (
                                <tr key={promo._id} className="hover transition-colors">
                                    <td>
                                        <div className="avatar">
                                            <div className="w-20 h-28 rounded-xl shadow-md border border-base-300">
                                                <img src={promo.image} alt={promo.title} className="object-cover" />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-bold text-lg text-primary">{promo.title}</div>
                                        <div className="text-xs opacity-50 flex items-center gap-1 mt-1 font-mono">
                                            <FiLink size={10} /> {promo.link}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="badge badge-neutral font-bold p-3">
                                            {promo.priority}
                                        </div>
                                    </td>
                                    <td className="text-center font-bold">
                                        <div className="flex items-center justify-center gap-1.5 text-secondary">
                                            <FiTrendingUp size={14} />
                                            {(promo.views || 0).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        {promo.active ? (
                                            <div className="badge badge-success gap-1.5 font-bold py-3 pr-4">
                                                <FiCheckCircle size={14} /> HIỂN THỊ
                                            </div>
                                        ) : (
                                            <div className="badge badge-ghost gap-1.5 font-bold py-3 pr-4 opacity-50">
                                                <FiXCircle size={14} /> ĐANG ẨN
                                            </div>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <div className="flex justify-center items-center gap-1">
                                            <div className="tooltip" data-tip="Sửa nội dung">
                                                <button
                                                    className="btn btn-ghost btn-lg btn-circle"
                                                    onClick={() => handleOpenEditModal(promo)}
                                                >
                                                    <FiEdit size={22} className="text-info" />
                                                </button>
                                            </div>
                                            <div className="tooltip" data-tip="Xóa đề cử">
                                                <button
                                                    className="btn btn-ghost btn-lg btn-circle"
                                                    onClick={() => handleDeletePromotion(promo._id)}
                                                >
                                                    <FiTrash2 size={22} className="text-error" />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
