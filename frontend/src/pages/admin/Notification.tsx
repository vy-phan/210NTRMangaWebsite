import { useState, useEffect, useMemo } from 'react';
import {
    getAllNotificationsAPI,
    createNotificationAPI,
    updateNotificationAPI,
    deleteNotificationAPI
} from '../../api/notificationApi';
import { FiPlus, FiTrash2, FiCheckCircle, FiXCircle, FiInfo, FiSearch, FiCalendar, FiClock, FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';
import NotificationModal from '../../components/admin/NotificationModal';

const NotificationAdmin = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await getAllNotificationsAPI();
            setNotifications(data);
        } catch (error) {
            toast.error("Không thể tải danh sách thông báo");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => n.content.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [notifications, searchTerm]);

    const handleOpenAdd = () => {
        setEditingNotification(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (notif: Notification) => {
        setEditingNotification(notif);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleSave = async (data: { content: string; isActive: boolean }) => {
        const apiCall = modalMode === 'add'
            ? createNotificationAPI(data)
            : updateNotificationAPI(editingNotification!._id, data);

        toast.promise(apiCall, {
            loading: 'Đang xử lý...',
            success: () => {
                fetchNotifications();
                setIsModalOpen(false);
                return modalMode === 'add' ? 'Đã tạo thông báo mới' : 'Đã cập nhật thông báo';
            },
            error: 'Thao tác thất bại',
        });
    };

    const handleToggleStatus = async (notif: Notification) => {
        try {
            await updateNotificationAPI(notif._id, { isActive: !notif.isActive });
            toast.success("Đã cập nhật trạng thái");
            fetchNotifications();
        } catch (error) {
            toast.error("Cập nhật thất bại");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
        toast.promise(deleteNotificationAPI(id), {
            loading: 'Đang xóa...',
            success: () => {
                fetchNotifications();
                return 'Đã xóa thành công';
            },
            error: 'Xóa thất bại',
        });
    };

    if (isLoading && notifications.length === 0) return (
        <div className="flex justify-center items-center h-96">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Thông Báo Website</h1>
                    <p className="text-base-content/70 mt-1">Cấu hình các dòng thông báo quan trọng chạy trên đầu trang web.</p>
                </div>
                <button onClick={handleOpenAdd} className="btn btn-primary btn-md shadow-lg shadow-primary/20 rounded-xl gap-2 px-6">
                    <FiPlus /> Tạo thông báo
                </button>
            </header>

            <div className="form-control">
                <label className="input input-bordered flex items-center gap-3 bg-base-100/50 focus-within:bg-base-100 transition-colors">
                    <FiSearch className="text-base-content/50" />
                    <input
                        type="text"
                        className="grow border-none focus:ring-0 h-12"
                        placeholder="Tìm kiếm nội dung thông báo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </label>
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="text-center py-24 bg-base-200/50 border-2 border-dashed border-base-300 rounded-[2rem]">
                    <FiInfo className="mx-auto text-5xl text-base-content/30 mb-4" />
                    <h2 className="text-xl font-semibold">Chưa có thông báo nào</h2>
                    <p className="text-base-content/60 mt-2">Hãy bắt đầu bằng cách nhấn nút "Tạo thông báo" phía trên.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-base-100 rounded-[2rem] shadow-xl border border-base-200">
                    <table className="table w-full">
                        <thead className="bg-base-300 font-bold">
                            <tr>
                                <th className="p-6">Dòng Nội dung</th>
                                <th className="text-center">Trạng thái</th>
                                <th className="text-center">Thời gian tạo</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((notif) => (
                                <tr key={notif._id} className="hover:bg-base-200/50 transition-colors border-b border-base-200 last:border-0 group">
                                    <td className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-2xl ${notif.isActive ? 'bg-primary/10 text-primary shadow-sm' : 'bg-base-300/40 text-base-content/30'}`}>
                                                <FiInfo size={20} />
                                            </div>
                                            <div className="max-w-xl">
                                                <p className="font-bold text-base text-base-content leading-relaxed">
                                                    {notif.content}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs opacity-50 font-medium">
                                                    <span className="flex items-center gap-1"><FiCalendar /> {new Date(notif.createdAt).toLocaleDateString('vi-VN')}</span>
                                                    <span className="flex items-center gap-1"><FiClock /> {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            onClick={() => handleToggleStatus(notif)}
                                            className={`badge badge-lg gap-2 cursor-pointer font-bold py-5 pr-6 transition-all hover:scale-105 active:scale-95 border-none ${notif.isActive
                                                ? 'bg-success/15 text-success shadow-sm'
                                                : 'bg-base-200 text-base-content/40 opacity-50'
                                                }`}
                                        >
                                            {notif.isActive ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                                            {notif.isActive ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                                        </button>
                                    </td>
                                    <td className="text-center font-bold text-sm opacity-60">
                                        {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="text-center p-6">
                                        <div className="flex justify-center items-center gap-1">
                                            <div className="tooltip" data-tip="Chỉnh sửa nội dung">
                                                <button
                                                    onClick={() => handleOpenEdit(notif)}
                                                    className="btn btn-ghost btn-circle btn-lg text-info hover:bg-info/10"
                                                >
                                                    <FiEdit size={24} />
                                                </button>
                                            </div>
                                            <div className="tooltip" data-tip="Xóa thông báo">
                                                <button
                                                    onClick={() => handleDelete(notif._id)}
                                                    className="btn btn-ghost btn-circle btn-lg text-error hover:bg-error/10"
                                                >
                                                    <FiTrash2 size={24} />
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

            <NotificationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingNotification}
                mode={modalMode}
            />
        </div>
    );
};

export default NotificationAdmin;
