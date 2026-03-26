import { useState, useEffect } from 'react';
import {
    getAllNotificationsAPI,
    createNotificationAPI,
    updateNotificationAPI,
    deleteNotificationAPI,
    type Notification 
} from '../../api/notificationApi';
import { FiPlus, FiTrash2, FiBell, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const NotificationAdmin = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState('');
    const [isActive, setIsActive] = useState(true);

    const fetchNotifications = async () => {
        try {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await createNotificationAPI({ content, isActive });
            toast.success("Đã tạo thông báo mới");
            setContent('');
            setIsActive(true);
            fetchNotifications();
        } catch (error) {
            toast.error("Lỗi khi tạo thông báo");
        } finally {
            setIsSubmitting(false);
        }
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
        try {
            await deleteNotificationAPI(id);
            toast.success("Đã xóa thông báo");
            fetchNotifications();
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FiBell className="text-primary" />
                    Quản lý thông báo Website
                </h1>
                <p className="text-base-content/60">Cấu hình thông báo hiển thị ở đầu trang web</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Tạo mới */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-xl border border-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4">Tạo thông báo mới</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Nội dung thông báo</span>
                                    </label>
                                    <textarea
                                        className="textarea textarea-bordered h-32 focus:textarea-primary"
                                        placeholder="Ví dụ: Website đang trong quá trình bảo trì..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-control hover:bg-base-200 p-2 rounded-lg transition-colors cursor-pointer">
                                    <label className="label cursor-pointer justify-start gap-4">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                        />
                                        <span className="label-text font-medium">Kích hoạt ngay lập tức?</span>
                                    </label>
                                    <p className="text-[10px] text-base-content/50 ml-12">
                                        * Lưu ý: Khi kích hoạt, các thông báo cũ sẽ tự động bị tắt.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                                    disabled={isSubmitting || !content.trim()}
                                >
                                    <FiPlus /> Tạo thông báo
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Danh sách thông báo */}
                <div className="lg:col-span-2">
                    <div className="card bg-base-100 shadow-xl border border-base-200">
                        <div className="card-body">
                            <h2 className="card-title text-lg mb-4 flex justify-between items-center">
                                Lịch sử thông báo
                                <span className="badge badge-ghost font-normal">{notifications.length} bản ghi</span>
                            </h2>

                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-10 text-base-content/40 italic">
                                    Chưa có thông báo nào được tạo
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th>Nội dung</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày tạo</th>
                                                <th className="text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notifications.map((notif) => (
                                                <tr key={notif._id} className="hover:bg-base-200/50 transition-colors">
                                                    <td className="max-w-xs truncate font-medium">
                                                        {notif.content}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            onClick={() => handleToggleStatus(notif)}
                                                            className={`badge gap-1 cursor-pointer hover:scale-105 transition-transform ${
                                                                notif.isActive ? 'badge-success' : 'badge-ghost opacity-50'
                                                            }`}
                                                        >
                                                            {notif.isActive ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                                            {notif.isActive ? 'Đang bật' : 'Đã tắt'}
                                                        </button>
                                                    </td>
                                                    <td className="text-xs text-base-content/60">
                                                        {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="text-right">
                                                        <button
                                                            onClick={() => handleDelete(notif._id)}
                                                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationAdmin;
