import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FiTrash2, FiCheckCircle, FiXCircle, FiClock, FiSearch, FiExternalLink } from 'react-icons/fi';
import { getAllReportsAPI, updateReportStatusAPI, deleteReportAPI } from '../../api/chapterReportApi';
import { useSearchParams, Link } from 'react-router-dom';
import { formatSmartTime } from '../../utils/dateFomat';
import { slugify } from '../../utils/slugify';

const ReportAdmin = () => {
    const [reports, setReports] = useState<PopulatedChapterReport[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleteMode, setIsBulkDeleteMode] = useState<boolean>(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // Lấy filter từ URL
    const filterStatus = searchParams.get('status') || '';
    const filterType = searchParams.get('type') || '';
    const searchTerm = searchParams.get('q') || '';

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const data = await getAllReportsAPI();
            setReports(data);
        } catch (err) {
            toast.error('Không thể tải danh sách báo cáo.');
        } finally {
            setIsLoading(false);
        }
    };

    // Logic lọc dữ liệu
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const matchesStatus = filterStatus ? report.status === filterStatus : true;
            const matchesType = filterType ? report.errorType === filterType : true;
            const matchesSearch = searchTerm
                ? (report.mangaId?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                report.description.toLowerCase().includes(searchTerm.toLowerCase())
                : true;
            return matchesStatus && matchesType && matchesSearch;
        });
    }, [reports, filterStatus, filterType, searchTerm]);

    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') newParams.delete(key);
            else newParams.set(key, value);
        });
        setSearchParams(newParams, { replace: true });
        setSelectedIds([]); // Bỏ chọn khi thay đổi bộ lọc
        setIsBulkDeleteMode(false); // Thoát mode xóa nhiều
    };

    const handleUpdateStatus = async (id: string, newStatus: ReportStatus) => {
        try {
            const updated = await updateReportStatusAPI(id, newStatus);
            setReports(prev => prev.map(r => r._id === id ? { ...r, status: updated.status } : r));
            toast.success('Đã cập nhật trạng thái báo cáo.');
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi báo cáo này?')) return;
        try {
            await deleteReportAPI(id);
            setReports(prev => prev.filter(r => r._id !== id));
            setSelectedIds(prev => prev.filter(selected => selected !== id));
            toast.success('Đã xóa báo cáo.');
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi xóa báo cáo.');
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} bản ghi đã chọn?`)) return;
        try {
            await Promise.all(selectedIds.map(delId => deleteReportAPI(delId)));
            setReports(prev => prev.filter(r => !selectedIds.includes(r._id)));
            setSelectedIds([]);
            setIsBulkDeleteMode(false);
            toast.success(`Đã xóa thành công ${selectedIds.length} báo cáo.`);
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi xóa hàng loạt báo cáo.');
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Chỉ chọn những bản ghi có thể xóa (Đã sửa hoặc Từ chối)
            const deletableIds = filteredReports.filter(r => r.status !== 'pending').map(r => r._id);
            setSelectedIds(deletableIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(selected => selected !== id) : [...prev, id]);
    };

    const getStatusText = (status: ReportStatus) => {
        const mapping: Record<ReportStatus, string> = {
            pending: 'Chờ xử lý',
            fixed: 'Đã sửa',
            rejected: 'Từ chối'
        };
        return mapping[status] || status;
    };

    const getErrorTypeText = (type: ErrorType) => {
        const mapping: Record<ErrorType, string> = {
            image_broken: 'Lỗi ảnh',
            wrong_order: 'Sai thứ tự',
            missing_pages: 'Thiếu trang',
            wrong_manga: 'Nhầm truyện',
            other: 'Lỗi khác'
        };
        return mapping[type] || type;
    };

    if (isLoading) return <div className="flex justify-center items-center h-96"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        Quản lý Báo cáo lỗi chương
                    </h1>
                    <p className="text-base-content/70 mt-1">
                        Tổng cộng: {filteredReports.length} báo cáo.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {isBulkDeleteMode ? (
                        <button
                            className={`btn font-bold shadow-md animate-in slide-in-from-right-2 ${selectedIds.length > 0 ? 'btn-error text-white' : 'btn-neutral text-neutral-content'}`}
                            onClick={selectedIds.length > 0 ? handleDeleteSelected : () => setIsBulkDeleteMode(false)}
                        >
                            {selectedIds.length > 0 ? (
                                <><FiTrash2 /> Xóa ({selectedIds.length}) mục</>
                            ) : (
                                'Hủy thao tác'
                            )}
                        </button>
                    ) : (
                        <button
                            className="btn btn-outline btn-error font-bold"
                            onClick={() => setIsBulkDeleteMode(true)}
                        >
                            <FiTrash2 /> Chọn nhiều
                        </button>
                    )}

                    <select
                        className="select select-bordered select-md"
                        value={filterStatus}
                        onChange={(e) => updateParams({ status: e.target.value })}
                    >
                        <option value="">Trạng thái: Tất cả</option>
                        <option value="pending">⏳ Đang chờ</option>
                        <option value="fixed">✅ Đã sửa</option>
                        <option value="rejected">❌ Từ chối</option>
                    </select>

                    <select
                        className="select select-bordered select-md"
                        value={filterType}
                        onChange={(e) => updateParams({ type: e.target.value })}
                    >
                        <option value="">Loại lỗi: Tất cả</option>
                        <option value="image_broken">Lỗi ảnh</option>
                        <option value="missing_pages">Thiếu trang</option>
                        <option value="wrong_order">Sai thứ tự</option>
                        <option value="other">Khác</option>
                    </select>

                    {(filterStatus || filterType || searchTerm) && (
                        <button className="btn btn-ghost text-error" onClick={() => setSearchParams({})}>
                            Xóa lọc
                        </button>
                    )}
                </div>
            </header>

            <div className="form-control">
                <div className="input input-bordered flex items-center gap-2">
                    <FiSearch className="opacity-50" />
                    <input
                        type="text"
                        className="grow"
                        placeholder="Tìm theo tên truyện "
                        value={searchTerm}
                        onChange={(e) => updateParams({ q: e.target.value })}
                    />
                </div>
            </div>

            <div className="overflow-x-auto bg-base-100 rounded-box shadow-lg border border-base-200">
                <table className="table w-full">
                    <thead className="bg-base-300">
                        <tr>
                            {isBulkDeleteMode && (
                                <th className="w-10">
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            onChange={handleSelectAll}
                                            checked={filteredReports.length > 0 && selectedIds.length === filteredReports.filter(r => r.status !== 'pending').length && filteredReports.filter(r => r.status !== 'pending').length > 0}
                                        />
                                    </label>
                                </th>
                            )}
                            <th className="w-1/4">Truyện / Chương</th>
                            <th className="w-1/6">Loại lỗi</th>
                            <th>Mô tả / Người báo</th>
                            <th>Thời gian</th>
                            <th className="text-center">Trạng thái</th>
                            <th className="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReports.map(report => {
                            const isDeletable = report.status !== 'pending';
                            return (
                                <tr key={report._id} className={`hover ${selectedIds.includes(report._id) ? 'bg-base-200' : ''}`}>
                                    {isBulkDeleteMode && (
                                        <th className="w-10">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={selectedIds.includes(report._id)}
                                                    onChange={() => handleSelectRow(report._id)}
                                                    disabled={!isDeletable}
                                                />
                                            </label>
                                        </th>
                                    )}
                                    <td>
                                        <div className="font-bold text-primary">{report.mangaId?.title || 'Truyện đã bị xóa'}</div>
                                        <div className="text-xs opacity-70">Chương {report.chapterId?.title || 'N/A'}</div>
                                        <Link
                                            to={`/manga/${slugify(report.mangaId?.title || 'unknown')}/chapter/${(report.chapterId?.number || 0) + 1}`}
                                            target="_blank"
                                            className="text-[10px] link link-info flex items-center gap-1 mt-1"
                                        >
                                            Xem thực tế <FiExternalLink size={10} />
                                        </Link>
                                    </td>
                                    <td>
                                        <span className="badge badge-outline badge-md whitespace-nowrap">
                                            {getErrorTypeText(report.errorType)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="max-w-xs md:max-w-md whitespace-normal break-words italic text-sm mb-1 leading-relaxed">
                                            "{report.description}"
                                        </div>
                                        <div className="text-[10px] bg-base-200 px-2 py-0.5 rounded-full inline-block">
                                            Từ: <span className="font-semibold">{report.reporter?.displayName || 'Khách ẩn danh'}</span>
                                            {report.reporter?.email && ` (${report.reporter.email})`}
                                        </div>
                                    </td>
                                    <td className="text-xs whitespace-nowrap">
                                        {formatSmartTime(report.createdAt)}
                                    </td>
                                    <td className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`badge badge-sm font-bold whitespace-nowrap p-2 ${report.status === 'fixed' ? 'badge-success' :
                                                report.status === 'rejected' ? 'badge-error' : 'badge-warning'
                                                }`}>
                                                {getStatusText(report.status).toUpperCase()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex justify-center gap-1 text-2xl">
                                            <div className="tooltip" data-tip="Đánh dấu đã sửa">
                                                <button
                                                    className="btn btn-ghost btn-circle"
                                                    onClick={() => handleUpdateStatus(report._id, 'fixed')}
                                                >
                                                    <FiCheckCircle className="text-success" size={22} />
                                                </button>
                                            </div>
                                            <div className="tooltip" data-tip="Từ chối/Không lỗi">
                                                <button
                                                    className="btn btn-ghost btn-circle"
                                                    onClick={() => handleUpdateStatus(report._id, 'rejected')}
                                                >
                                                    <FiXCircle className="text-error" size={22} />
                                                </button>
                                            </div>
                                            <div className="tooltip" data-tip="Xóa bản ghi">
                                                <button
                                                    className="btn btn-ghost btn-circle text-error"
                                                    onClick={() => handleDelete(report._id)}
                                                    disabled={!isDeletable}
                                                >
                                                    <FiTrash2 size={22} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {filteredReports.length === 0 && (
                    <div className="p-20 text-center space-y-3">
                        <FiClock className="mx-auto text-4xl opacity-20" />
                        <p className="opacity-50">Không tìm thấy báo cáo lỗi nào phù hợp.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportAdmin;
