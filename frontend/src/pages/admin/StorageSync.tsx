import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
    getSyncStatusAPI,
    deleteOrphanFolderAPI,
    deleteDbOnlyRecordsAPI,
    type MangaSyncDetail,
    type SyncStatusResponse,
} from '../../api/imageUpload';
import {
    FiRefreshCw, FiAlertTriangle, FiCheckCircle, FiDatabase, FiFolder,
    FiTrash2, FiSearch, FiCloud, FiInfo, FiFolderMinus,
} from 'react-icons/fi';

// ─── Cấu hình trạng thái (đổi tên thuật ngữ cho dễ hiểu) ───────────────────
const STATUS_CONFIG = {
    synced: {
        label: 'Upload đủ',
        badge: 'badge-success',
        icon: <FiCheckCircle />,
        description: 'Tất cả chương của truyện đều đã có ảnh trên ImageKit.',
    },
    no_images: {
        label: 'Chưa upload ảnh',
        badge: 'badge-ghost',
        icon: <FiFolder />,
        description: 'Truyện chưa có ảnh nào trên ImageKit (có thể đang dùng link ảnh từ web khác). Không phải lỗi.',
    },
    db_only: {
        label: 'Mất folder ImageKit',
        badge: 'badge-warning',
        icon: <FiDatabase />,
        description: 'Database còn ghi nhớ ảnh đã upload, nhưng folder ảnh trên ImageKit không còn. Có thể xóa dữ liệu rác này.',
    },
    chapter_mismatch: {
        label: 'Upload chưa đủ',
        badge: 'badge-info',
        icon: <FiAlertTriangle />,
        description: 'Chỉ một số chương có ảnh trên ImageKit, các chương còn lại đang dùng link ảnh từ web khác.',
    },
} as const;

type FilterStatus = 'all' | MangaSyncDetail['status'];

const FILTERS: FilterStatus[] = ['all', 'chapter_mismatch', 'db_only', 'no_images', 'synced'];

// ─── Component ──────────────────────────────────────────────────────────────
const StorageSyncAdmin = () => {
    const [data, setData] = useState<SyncStatusResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cleaningKey, setCleaningKey] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [search, setSearch] = useState('');

    // ── Quét ──
    const handleScan = async () => {
        setIsLoading(true);
        try {
            setData(await getSyncStatusAPI());
            toast.success('Quét hoàn tất!');
        } catch {
            toast.error('Không quét được storage. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Xóa folder thừa trên ImageKit ──
    const handleDeleteOrphan = async (slug: string) => {
        if (!window.confirm(`Xóa folder "${slug}" trên ImageKit?\nKhông có truyện nào trong DB dùng folder này.`)) return;
        setCleaningKey(`folder:${slug}`);
        try {
            const msg = await deleteOrphanFolderAPI(slug);
            toast.success(msg);
            setData(prev => prev ? {
                ...prev,
                orphanFolders: prev.orphanFolders.filter(s => s !== slug),
                summary: { ...prev.summary, orphanFolderCount: prev.summary.orphanFolderCount - 1 },
            } : prev);
        } catch {
            toast.error('Xóa thất bại.');
        } finally {
            setCleaningKey(null);
        }
    };

    // ── Xóa record ảnh rác trong DB ──
    const handleDeleteDbOnly = async (mangaName: string) => {
        if (!window.confirm(`Xóa toàn bộ record ảnh của "${mangaName}" trong DB?\nFolder trên ImageKit không tồn tại nên đây là dữ liệu rác.`)) return;
        setCleaningKey(`db:${mangaName}`);
        try {
            const msg = await deleteDbOnlyRecordsAPI(mangaName);
            toast.success(msg);
            setData(prev => prev ? {
                ...prev,
                dbOnlyImages: prev.dbOnlyImages.filter(n => n !== mangaName),
                mangaDetails: prev.mangaDetails.map(m =>
                    m.slug === mangaName
                        ? { ...m, status: 'no_images' as const, hasDbImages: false, dbChapterCount: 0 }
                        : m
                ),
                summary: {
                    ...prev.summary,
                    dbOnlyCount: prev.summary.dbOnlyCount - 1,
                    noImagesCount: prev.summary.noImagesCount + 1,
                },
            } : prev);
        } catch {
            toast.error('Xóa thất bại.');
        } finally {
            setCleaningKey(null);
        }
    };

    // ── Đếm theo trạng thái & lọc ──
    const counts = useMemo(() => {
        const c: Record<FilterStatus, number> = {
            all: 0, synced: 0, no_images: 0, db_only: 0, chapter_mismatch: 0,
        };
        (data?.mangaDetails ?? []).forEach(m => { c.all++; c[m.status]++; });
        return c;
    }, [data]);

    const filteredDetails = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (data?.mangaDetails ?? []).filter(m =>
            (filter === 'all' || m.status === filter) &&
            (!q || m.title.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q))
        );
    }, [data, filter, search]);

    const s = data?.summary;
    const issueCount = s ? s.chapterMismatchCount + s.dbOnlyCount + s.orphanFolderCount : 0;
    const busy = cleaningKey !== null;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* ── Header ── */}
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FiCloud className="text-primary" /> Đồng bộ Storage
                    </h1>
                    <p className="text-base-content/60 mt-1 text-sm max-w-xl">
                        So sánh ảnh trên ImageKit với dữ liệu trong MongoDB để biết truyện nào đã upload đủ ảnh,
                        truyện nào còn dùng link ảnh ngoài, và dữ liệu thừa cần dọn.
                    </p>
                </div>
                <button className="btn btn-primary shadow-lg" onClick={handleScan} disabled={isLoading}>
                    {isLoading
                        ? <span className="loading loading-spinner loading-sm" />
                        : <FiRefreshCw />}
                    {isLoading ? 'Đang quét...' : data ? 'Quét lại' : 'Quét storage'}
                </button>
            </header>

            {/* ── Chưa quét ── */}
            {!data && !isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-base-200 rounded-box text-center px-4">
                    <FiCloud className="text-6xl text-base-content/20" />
                    <p className="text-base-content/70 text-lg">Chưa có dữ liệu</p>
                    <p className="text-base-content/50 text-sm">Nhấn “Quét storage” để bắt đầu kiểm tra.</p>
                </div>
            )}

            {/* ── Đang quét ── */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="text-base-content/60">Đang so sánh ImageKit với MongoDB…</p>
                </div>
            )}

            {data && s && !isLoading && (
                <>
                    {/* ── Kết luận nhanh ── */}
                    {issueCount === 0 ? (
                        <div role="alert" className="alert alert-success">
                            <FiCheckCircle className="text-xl" />
                            <span>Mọi thứ đều khớp, không có gì cần xử lý.</span>
                        </div>
                    ) : (
                        <div role="alert" className="alert alert-warning">
                            <FiAlertTriangle className="text-xl" />
                            <span>
                                Có <strong>{issueCount}</strong> mục cần xem:{' '}
                                {s.chapterMismatchCount} truyện upload chưa đủ, {s.dbOnlyCount} truyện mất folder ImageKit,{' '}
                                {s.orphanFolderCount} folder thừa trên ImageKit.
                            </span>
                        </div>
                    )}

                    {/* ── Thẻ thống kê: bấm để lọc bảng ── */}
                    <section className="space-y-2">
                        <h2 className="text-sm font-semibold text-base-content/70">Tình trạng ảnh của các truyện</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {([
                                { key: 'all', label: 'Tổng truyện', value: s.totalMangas, cls: 'bg-base-200' },
                                { key: 'synced', label: 'Upload đủ', value: s.syncedCount, cls: 'bg-success/10 text-success' },
                                { key: 'no_images', label: 'Chưa upload ảnh', value: s.noImagesCount, cls: 'bg-base-300' },
                                { key: 'db_only', label: 'Mất folder ImageKit', value: s.dbOnlyCount, cls: 'bg-warning/10 text-warning' },
                                { key: 'chapter_mismatch', label: 'Upload chưa đủ', value: s.chapterMismatchCount, cls: 'bg-info/10 text-info' },
                            ] as { key: FilterStatus; label: string; value: number; cls: string }[]).map(card => (
                                <button
                                    key={card.key}
                                    type="button"
                                    onClick={() => setFilter(card.key)}
                                    className={`rounded-box p-4 flex flex-col gap-1 text-left transition
                                        hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary
                                        ${card.cls} ${filter === card.key ? 'ring-2 ring-primary' : ''}`}
                                >
                                    <span className="text-2xl font-bold">{card.value}</span>
                                    <span className="text-xs opacity-80">{card.label}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-base-content/50">
                            ImageKit đang có {s.imagekitFolderCount} folder. Bấm vào thẻ để lọc bảng bên dưới.
                        </p>
                    </section>

                    {/* ── Khu dọn dẹp ── */}
                    {(data.orphanFolders.length > 0 || data.dbOnlyImages.length > 0) && (
                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold text-base-content/70">Cần dọn dẹp</h2>

                            {data.orphanFolders.length > 0 && (
                                <div className="collapse collapse-arrow bg-error/10 border border-error/30">
                                    <input type="checkbox" defaultChecked aria-label="Mở/đóng danh sách folder thừa" />
                                    <div className="collapse-title font-semibold flex items-center gap-2 text-error">
                                        <FiFolderMinus />
                                        {data.orphanFolders.length} folder thừa trên ImageKit
                                    </div>
                                    <div className="collapse-content space-y-3">
                                        <p className="text-sm text-base-content/70">
                                            Folder tồn tại trên ImageKit nhưng không có truyện nào trong DB. Xóa sẽ mất ảnh vĩnh viễn.
                                        </p>
                                        <ul className="space-y-1">
                                            {data.orphanFolders.map(slug => {
                                                const key = `folder:${slug}`;
                                                return (
                                                    <li key={slug} className="flex items-center justify-between gap-2 bg-base-100 rounded-lg px-3 py-1.5">
                                                        <code className="font-mono text-sm truncate">{slug}</code>
                                                        <button
                                                            className="btn btn-error btn-outline btn-xs gap-1"
                                                            onClick={() => handleDeleteOrphan(slug)}
                                                            disabled={busy}
                                                        >
                                                            {cleaningKey === key
                                                                ? <span className="loading loading-spinner loading-xs" />
                                                                : <FiTrash2 />}
                                                            Xóa folder
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {data.dbOnlyImages.length > 0 && (
                                <div className="collapse collapse-arrow bg-warning/10 border border-warning/30">
                                    <input type="checkbox" defaultChecked aria-label="Mở/đóng danh sách record DB rác" />
                                    <div className="collapse-title font-semibold flex items-center gap-2 text-warning">
                                        <FiDatabase />
                                        {data.dbOnlyImages.length} truyện có record ảnh rác trong DB
                                    </div>
                                    <div className="collapse-content space-y-3">
                                        <p className="text-sm text-base-content/70">
                                            DB còn lưu ảnh nhưng folder trên ImageKit không có. Xóa record để DB sạch lại.
                                        </p>
                                        <ul className="space-y-1">
                                            {data.dbOnlyImages.map(name => {
                                                const key = `db:${name}`;
                                                return (
                                                    <li key={name} className="flex items-center justify-between gap-2 bg-base-100 rounded-lg px-3 py-1.5">
                                                        <code className="font-mono text-sm truncate">{name}</code>
                                                        <button
                                                            className="btn btn-warning btn-outline btn-xs gap-1"
                                                            onClick={() => handleDeleteDbOnly(name)}
                                                            disabled={busy}
                                                        >
                                                            {cleaningKey === key
                                                                ? <span className="loading loading-spinner loading-xs" />
                                                                : <FiTrash2 />}
                                                            Xóa record
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ── Bảng chi tiết ── */}
                    <section className="space-y-3">
                        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
                            <div role="tablist" className="tabs tabs-boxed bg-base-200 flex-wrap w-fit">
                                {FILTERS.map(f => (
                                    <button
                                        key={f}
                                        role="tab"
                                        className={`tab tab-sm ${filter === f ? 'tab-active' : ''}`}
                                        onClick={() => setFilter(f)}
                                    >
                                        {f === 'all' ? 'Tất cả' : STATUS_CONFIG[f].label} ({counts[f]})
                                    </button>
                                ))}
                            </div>
                            <label className="input input-bordered input-sm flex items-center gap-2 w-full lg:w-72">
                                <FiSearch className="opacity-50" />
                                <input
                                    type="text"
                                    placeholder="Tìm theo tên hoặc slug..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="grow"
                                />
                            </label>
                        </div>

                        <div className="overflow-x-auto bg-base-100 rounded-box shadow">
                            <table className="table table-sm table-zebra w-full">
                                <thead className="bg-base-300">
                                    <tr>
                                        <th>Trạng thái</th>
                                        <th>Truyện</th>
                                        <th className="text-center">Tổng số chương</th>
                                        <th className="text-center">Đã có ảnh trên ImageKit</th>
                                        <th>Chi tiết</th>
                                        <th className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDetails.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-base-content/50">
                                                Không có truyện nào khớp bộ lọc.
                                            </td>
                                        </tr>
                                    ) : filteredDetails.map(m => {
                                        const cfg = STATUS_CONFIG[m.status];
                                        const diff = m.ikChapterCount - m.dbChapterCount;
                                        return (
                                            <tr key={m._id} className="hover">
                                                <td>
                                                    <span className={`badge ${cfg.badge} badge-sm gap-1 whitespace-nowrap`}>
                                                        {cfg.icon} {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="max-w-[260px]">
                                                    <div className="font-semibold truncate" title={m.title}>{m.title}</div>
                                                    <code className="text-xs font-mono text-base-content/50">{m.slug}</code>
                                                </td>
                                                <td className="text-center font-mono">{m.dbChapterCount}</td>
                                                <td
                                                    className="text-center font-mono"
                                                    title={m.onImageKit ? `Các chương đã upload: ${m.ikChapters.join(', ')}` : undefined}
                                                >
                                                    {m.onImageKit ? m.ikChapterCount : <span className="text-base-content/30">—</span>}
                                                </td>
                                                <td className="text-xs max-w-[320px]">
                                                    {m.status === 'chapter_mismatch' && (
                                                        <span className="text-info font-medium">
                                                            {diff < 0
                                                                ? `${m.ikChapterCount}/${m.dbChapterCount} chương đã upload. ${Math.abs(diff)} chương còn lại đang dùng link ảnh từ web khác.`
                                                                : `ImageKit có nhiều hơn dữ liệu ${diff} chương, nên kiểm tra lại.`}
                                                        </span>
                                                    )}
                                                    {m.status === 'db_only' && (
                                                        <span className="text-warning">Database còn ảnh nhưng folder ImageKit không còn</span>
                                                    )}
                                                    {m.status === 'no_images' && (
                                                        <span className="text-base-content/40">Chưa có ảnh nào trên ImageKit</span>
                                                    )}
                                                    {m.status === 'synced' && (
                                                        <span className="text-success">Tất cả chương đã upload</span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    {m.status === 'db_only' ? (
                                                        <button
                                                            className="btn btn-warning btn-outline btn-xs gap-1"
                                                            onClick={() => handleDeleteDbOnly(m.slug)}
                                                            disabled={busy}
                                                        >
                                                            {cleaningKey === `db:${m.slug}`
                                                                ? <span className="loading loading-spinner loading-xs" />
                                                                : <FiTrash2 />}
                                                            Xóa record
                                                        </button>
                                                    ) : (
                                                        <span className="text-base-content/30 text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-base-content/40 text-right">
                            Hiển thị {filteredDetails.length} / {data.mangaDetails.length} truyện
                        </p>
                    </section>

                    {/* ── Chú giải thuật ngữ ── */}
                    <div className="collapse collapse-arrow bg-base-200">
                        <input type="checkbox" aria-label="Mở/đóng chú giải" />
                        <div className="collapse-title text-sm font-semibold flex items-center gap-2">
                            <FiInfo /> Giải thích các trạng thái
                        </div>
                        <div className="collapse-content">
                            <ul className="space-y-2 text-sm">
                                {(Object.keys(STATUS_CONFIG) as MangaSyncDetail['status'][]).map(k => (
                                    <li key={k} className="flex items-start gap-3">
                                        <span className={`badge ${STATUS_CONFIG[k].badge} badge-sm gap-1 whitespace-nowrap mt-0.5`}>
                                            {STATUS_CONFIG[k].icon} {STATUS_CONFIG[k].label}
                                        </span>
                                        <span className="text-base-content/70">{STATUS_CONFIG[k].description}</span>
                                    </li>
                                ))}
                                <li className="flex items-start gap-3">
                                    <span className="badge badge-error badge-outline badge-sm whitespace-nowrap mt-0.5">Folder thừa</span>
                                    <span className="text-base-content/70">
                                        Folder có trên ImageKit nhưng không có truyện tương ứng trong DB.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StorageSyncAdmin;