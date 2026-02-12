import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiWifiOff, FiTrash2, FiAlertCircle,
    FiDatabase, FiImage, FiInfo, FiHardDrive, FiShield, FiRefreshCw
} from 'react-icons/fi';
import { initDB, deleteChapterOffline } from '../utils/offlineDB';
import OfflineChapterList, { type OfflineChapter } from '../components/manga/OfflineChapterList';



interface StorageInfo {
    usage: number;
    quota: number;
    imageCount: number;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const OfflinePage = () => {
    const [savedChapters, setSavedChapters] = useState<OfflineChapter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storage, setStorage] = useState<StorageInfo>({ usage: 0, quota: 0, imageCount: 0 });

    // Giới hạn số lượng ảnh (cần khớp với vite.config.ts)
    const MAX_IMAGE_LIMIT = 5000;

    const handleClearAll = async () => {
        if (!window.confirm("Hành động này sẽ xóa toàn bộ truyện đã tải và đưa ứng dụng về trạng thái ban đầu. Bạn có chắc không?")) return;

        setIsLoading(true);
        try {
            // 1. Xóa toàn bộ Cache Storage (Ảnh)
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));

            // 2. Xóa IndexedDB (Metadata)
            const { deleteDB } = await import('idb');
            await deleteDB('manga-offline-db');

            // 3. Unregister Service Worker (Để reset lại từ đầu)
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
            }

            // 4. Reload trang để cập nhật
            window.location.reload();
        } catch (error) {
            console.error("Lỗi dọn dẹp:", error);
            alert("Có lỗi xảy ra khi dọn dẹp.");
            setIsLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const db = await initDB();
            const chapters = await db.getAll('chapters');
            chapters.sort((a, b) => b.createdAt - a.createdAt);
            setSavedChapters(chapters);

            const totalImages = chapters.reduce((acc, curr) => acc + (curr.images?.length || 0), 0);

            let usage = 0;
            let quota = 0;
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                usage = estimate.usage || 0;
                quota = estimate.quota || 0;
            }

            setStorage({ usage, quota, imageCount: totalImages });

        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (slug: string, index: number, mangaTitle: string, chapterTitle: string) => {
        if (!window.confirm(`Xóa bản lưu: ${mangaTitle} - ${chapterTitle}?`)) return;
        try {
            await deleteChapterOffline(slug, index);
            fetchData();
        } catch (error) {
            alert("Không thể xóa.");
        }
    };

    const handleDeleteManga = async (slug: string, mangaTitle: string) => {
        if (!window.confirm(`Bạn có chắc muốn xóa TẤT CẢ chương đã tải của truyện "${mangaTitle}"?`)) return;

        // Lấy danh sách chương của manga này
        const chaptersToDelete = savedChapters.filter(c => c.slug === slug);

        setIsLoading(true);
        try {
            for (const chap of chaptersToDelete) {
                await deleteChapterOffline(chap.slug, chap.chapterIndex);
            }
            fetchData();
        } catch (error) {
            console.error("Lỗi xóa truyện:", error);
            alert("Có lỗi xảy ra khi xóa truyện.");
            setIsLoading(false);
        }
    };

    const usagePercent = Math.min((storage.imageCount / MAX_IMAGE_LIMIT) * 100, 100);

    return (
        <div className="min-h-screen bg-base-200 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* === HEADER: THỐNG KÊ === */}
                {/* === HEADER: THỐNG KÊ (ĐÃ NÂNG CẤP UI) === */}
                <div className="bg-base-100 rounded-2xl shadow-lg p-6 mb-6 border border-base-200 relative overflow-hidden">

                    {/* Hiệu ứng nền mờ (Trang trí cho xịn) */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Hàng 1: Tiêu đề + Nút Xóa */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 relative z-10">

                        {/* Cụm Tiêu đề bên trái */}
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-base-200/50 rounded-2xl text-warning shadow-sm">
                                <FiWifiOff className="text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight">Tủ Sách Offline</h1>
                                <p className="text-sm text-base-content/60 font-medium">Đọc truyện mọi lúc, không cần mạng</p>
                            </div>
                        </div>

                        {/* Nút Xóa Dữ Liệu (Đưa vào góc phải) */}
                        <button
                            onClick={handleClearAll}
                            className="btn btn-error btn-outline btn-sm gap-2 shadow-sm hover:shadow-md transition-all"
                            title="Xóa toàn bộ truyện và reset dữ liệu"
                        >
                            <FiTrash2 /> Xóa tất cả dữ liệu
                        </button>
                    </div>

                    {/* Đường kẻ ngăn cách mờ */}
                    <div className="divider my-2"></div>

                    {/* Hàng 2: Thông số kỹ thuật */}
                    <div className="flex flex-col lg:flex-row gap-6 items-center">

                        {/* Stats Box */}
                        <div className="stats shadow-sm bg-base-200/50 border border-base-200 w-full lg:w-auto shrink-0">
                            <div className="stat py-2 px-4">
                                <div className="stat-figure text-primary">
                                    <FiDatabase className="w-5 h-5" />
                                </div>
                                <div className="stat-title text-xs font-bold uppercase opacity-60">Bộ nhớ máy</div>
                                <div className="stat-value text-lg text-primary">{formatBytes(storage.usage)}</div>
                                <div className="stat-desc text-xs">Tổng {formatBytes(storage.quota)}</div>
                            </div>

                            <div className="stat py-2 px-4 border-l border-base-300">
                                <div className="stat-figure text-secondary">
                                    <FiImage className="w-5 h-5" />
                                </div>
                                <div className="stat-title text-xs font-bold uppercase opacity-60">Ảnh đã lưu</div>
                                <div className="stat-value text-lg text-secondary">{storage.imageCount}</div>
                                <div className="stat-desc text-xs">Giới hạn {MAX_IMAGE_LIMIT}</div>
                            </div>
                        </div>

                        {/* Progress Bar Section */}
                        <div className="w-full">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase opacity-60">Trạng thái kho truyện</span>
                                    <span className="font-semibold text-sm">
                                        {usagePercent < 50 ? "Thoải mái lưu trữ" : usagePercent < 80 ? "Sắp đầy" : "Cần dọn dẹp"}
                                    </span>
                                </div>
                                <span className="font-mono font-bold text-lg">{usagePercent.toFixed(1)}%</span>
                            </div>
                            <progress
                                className={`progress w-full h-3 transition-all duration-500 ${usagePercent > 90 ? 'progress-error' :
                                    usagePercent > 60 ? 'progress-warning' : 'progress-success'
                                    }`}
                                value={usagePercent}
                                max="100"
                            ></progress>
                        </div>
                    </div>
                </div>

                {/* === ACCORDION: GIẢI THÍCH CƠ CHẾ === */}
                <div className="collapse collapse-arrow bg-base-100 shadow-sm rounded-xl mb-8 border border-base-200">
                    <input type="checkbox" />
                    <div className="collapse-title text-base font-medium flex items-center gap-2 text-info">
                        <FiInfo />
                        Tìm hiểu về cơ chế lưu trữ Offline
                    </div>
                    <div className="collapse-content">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
                            <div className="bg-base-200 p-3 rounded-lg">
                                <h3 className="font-bold flex items-center gap-2 mb-1"><FiHardDrive /> Lưu ở đâu?</h3>
                                <p className="text-base-content/70 text-xs">
                                    Truyện được lưu trực tiếp vào <strong>bộ nhớ trình duyệt</strong> trên thiết bị của bạn. Dữ liệu không được gửi lên máy chủ, đảm bảo riêng tư và tốc độ cao.
                                </p>
                            </div>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <h3 className="font-bold flex items-center gap-2 mb-1"><FiShield /> Giới hạn</h3>
                                <p className="text-base-content/70 text-xs">
                                    Hệ thống cho phép lưu tối đa <strong>{MAX_IMAGE_LIMIT} ảnh</strong> (khoảng 200 chương). Nếu ổ cứng thiết bị đầy, trình duyệt có thể ngăn chặn việc tải thêm.
                                </p>
                            </div>
                            <div className="bg-base-200 p-3 rounded-lg">
                                <h3 className="font-bold flex items-center gap-2 mb-1"><FiRefreshCw /> Tự động xóa</h3>
                                <p className="text-base-content/70 text-xs">
                                    Khi vượt quá giới hạn hoặc sau <strong>60 ngày</strong>, các ảnh cũ nhất sẽ tự động bị xóa để giải phóng bộ nhớ cho các chương mới hơn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === CONTENT LIST === */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
                ) : savedChapters.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl text-center p-10">
                        <FiAlertCircle className="text-5xl text-base-content/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">Chưa có dữ liệu</h3>
                        <p className="text-base-content/70 mb-4">Hãy tải truyện khi có mạng để đọc tại đây.</p>
                        <Link to="/" className="btn btn-primary btn-wide mx-auto">Về trang chủ</Link>
                    </div>
                ) : (
                    <OfflineChapterList
                        chapters={savedChapters}
                        onDelete={handleDelete}
                        onDeleteManga={handleDeleteManga}
                    />
                )}
            </div>
        </div>
    );
};

export default OfflinePage;