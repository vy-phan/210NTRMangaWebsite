import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiLayers } from 'react-icons/fi';
import { 
    getAllBannersAdminAPI, 
    createBannerAPI, 
    updateBannerAPI, 
    deleteBannerAPI, 
    type BannerInput 
} from '../../api/bannerApi'; 
import BannerModal from '../../components/admin/BannerModal'; 

const BannerAdmin = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    // Fetch dữ liệu
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setIsLoading(true);
                const data = await getAllBannersAdminAPI();
                setBanners(data);
            } catch (err) {
                setError('Không thể tải danh sách banner.');
                toast.error('Lỗi khi tải dữ liệu!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBanners();
    }, []);

    const handleOpenAddModal = () => {
        setEditingBanner(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (banner: Banner) => {
        setEditingBanner(banner);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    // Xử lý Lưu (Thêm/Sửa)
    const handleSaveBanner = async (bannerData: BannerInput) => {
        const apiCall = modalMode === 'add'
            ? createBannerAPI(bannerData)
            : updateBannerAPI(editingBanner!._id, bannerData);

        toast.promise(apiCall, {
            loading: 'Đang lưu banner...',
            success: (result) => {
                if (modalMode === 'add') {
                    setBanners(prev => [result, ...prev]);
                } else {
                    setBanners(prev => prev.map(b => b._id === result._id ? result : b));
                }
                handleCloseModal();
                return 'Thành công!';
            },
            error: 'Lỗi khi lưu banner.',
        });
    };

    // Xử lý Xóa
    const handleDeleteBanner = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
            toast.promise(deleteBannerAPI(id), {
                loading: 'Đang xóa...',
                success: () => {
                    setBanners(prev => prev.filter(b => b._id !== id));
                    return 'Đã xóa banner!';
                },
                error: 'Lỗi khi xóa.',
            });
        }
    };

    // Xử lý Toggle Active nhanh ngay trên bảng
    const handleToggleActiveQuick = async (banner: Banner) => {
        try {
            const newStatus = !banner.active;
            // Optimistic update (Cập nhật UI trước cho mượt)
            setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, active: newStatus } : b));
            
            await updateBannerAPI(banner._id, { active: newStatus });
            toast.success(`Đã ${newStatus ? 'hiện' : 'ẩn'} banner: ${banner.title}`);
        } catch (error) {
            // Revert nếu lỗi
            setBanners(prev => prev.map(b => b._id === banner._id ? { ...b, active: !banner.active } : b));
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-96"><span className="loading loading-spinner loading-lg"></span></div>;
    if (error) return <div role="alert" className="alert alert-error"><span>{error}</span></div>;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Banner</h1>
                    <p className="text-base-content/70 mt-1">Tổng cộng: {banners.length} banner.</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenAddModal}><FiPlus /> Thêm Banner</button>
            </header>

            {banners.length === 0 ? (
                <div className="text-center py-16 bg-base-200 rounded-lg">
                    <FiLayers className="mx-auto text-5xl text-base-content/30 mb-4" />
                    <h2 className="text-xl font-semibold">Chưa có banner nào</h2>
                </div>
            ) : (
                <div className="overflow-x-auto bg-base-100 rounded-box shadow-lg">
                    <table className="table w-full align-middle">
                        <thead className="text-base bg-base-300">
                            <tr>
                                <th>Preview</th>
                                <th>Thông tin Banner</th>
                                <th className="text-center">Độ ưu tiên</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.map(banner => (
                                <tr key={banner._id} className="hover">
                                    <td>
                                        {/* Mô phỏng Banner thu nhỏ */}
                                        <div className="relative w-32 h-16 rounded-lg overflow-hidden border border-base-300 bg-black">
                                            <img src={banner.bannerImg} className="w-full h-full object-cover opacity-80" alt="bg" />
                                            <img src={banner.charImg} className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[120%] object-contain" alt="char" />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-bold text-lg">{banner.title}</div>
                                        <a 
                                            href={banner.link.startsWith('http') ? banner.link : `${window.location.origin}${banner.link}`}
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-xs text-info hover:underline flex items-center gap-1 font-mono"
                                        >
                                            {banner.link}
                                        </a>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge badge-lg font-bold">{banner.priority}</span>
                                    </td>
                                    <td className="text-center">
                                        {/* Click để toggle trạng thái */}
                                        <div 
                                            className={`badge cursor-pointer select-none gap-2 p-3 ${banner.active ? 'badge-success text-white' : 'badge-ghost'}`}
                                            onClick={() => handleToggleActiveQuick(banner)}
                                            title="Nhấn để bật/tắt"
                                        >
                                            {banner.active ? 'Đang hiện' : 'Đang ẩn'}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="tooltip" data-tip="Sửa Banner">
                                                <button
                                                    className="btn btn-ghost btn-circle"
                                                    onClick={() => handleOpenEditModal(banner)}
                                                >
                                                    <FiEdit className="text-info w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="tooltip" data-tip="Xóa Banner">
                                                <button
                                                    className="btn btn-ghost btn-circle"
                                                    onClick={() => handleDeleteBanner(banner._id)}
                                                >
                                                    <FiTrash2 className="text-error w-5 h-5" />
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

            <BannerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveBanner}
                initialData={editingBanner}
                mode={modalMode}
            />
        </div>
    );
};

export default BannerAdmin;