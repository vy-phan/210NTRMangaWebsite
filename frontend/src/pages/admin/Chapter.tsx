import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getChaptersByMangaIdAPI, createChapterAPI, updateChapterAPI, deleteChapterAPI, type ChapterInput } from '../../api/chapterApi';
import ChapterModal from '../../components/admin/ChapterModal';
import { FiPlus, FiEdit, FiTrash2, FiImage } from 'react-icons/fi';
import ImageLibraryModal from '../../components/admin/ImageLibraryModal';
import { getMangaTitleByIdAPI } from '../../api/mangaApi';
import { deleteChapterImagesAPI } from '../../api/imageUpload';
import { formatSmartTime } from '../../utils/dateFomat';

const ChapterAdmin = () => {
    const { mangaId, mangaName } = useParams<{ mangaId: string, mangaName: string }>();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [currentMangaTitle, setCurrentMangaTitle] = useState<string>('Đang tải...');
    const [isLoading, setIsLoading] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();
    const sortOrder = (searchParams.get('sort') as 'asc' | 'desc') || 'desc';
    const [showId, setShowId] = useState(false);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleteMode, setIsBulkDeleteMode] = useState<boolean>(false);

    // Helper to update URL params
    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams, { replace: true });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);

    useEffect(() => {
        if (!mangaId) return;
        const fetchChapters = async () => {
            try {
                setIsLoading(true);
                const [chaptersData, mangaData] = await Promise.all([
                    getChaptersByMangaIdAPI(mangaId),
                    getMangaTitleByIdAPI(mangaId)
                ]);

                // Xử lý danh sách chương
                const sortedData = chaptersData.sort((a, b) => a.number - b.number);
                setChapters(sortedData);

                // Xử lý tên truyện
                setCurrentMangaTitle(mangaData.title);

            } catch (error) {
                toast.error("Không thể tải danh sách chương.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchChapters();
    }, [mangaId]);

    const handleOpenAddModal = () => {
        setEditingChapter(null);
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (chapter: Chapter) => {
        setEditingChapter(chapter);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSaveChapter = async (chapterData: Omit<ChapterInput, 'manga'>) => {
        const fullChapterData = { ...chapterData, manga: mangaId! };

        const apiCall = modalMode === 'add'
            ? createChapterAPI(fullChapterData)
            : updateChapterAPI(editingChapter!._id, fullChapterData);

        toast.promise(apiCall, {
            loading: 'Đang lưu chương...',
            success: (result) => {
                if (modalMode === 'add') {
                    setChapters(prev => [result, ...prev]);
                } else {
                    setChapters(prev => prev.map(c => c._id === result._id ? result : c));
                }
                handleCloseModal();
                return 'Lưu chương thành công!';
            },
            error: 'Lỗi khi lưu chương.',
        });
    };

    const handleDeleteChapter = async (chapter: Chapter) => {
        if (!window.confirm(`Bạn có chắc muốn xóa chương ${chapter.number} và toàn bộ ảnh của nó?`)) {
            return;
        }

        const deletePromise = async () => {
            // 1. Xóa ảnh trên ImageKit và trong DB (nếu có mangaName)
            if (mangaName) {
                try {
                    await deleteChapterImagesAPI(mangaName, chapter.number);
                } catch (error) {
                    console.error("Lỗi khi xóa ảnh của chương:", error);
                    // Có thể throw lỗi hoặc vẫn tiếp tục xóa chapter tùy logic
                    // Ở đây chọn tiếp tục xóa chapter
                }
            }

            // 2. Xóa Chapter record
            await deleteChapterAPI(chapter._id);
            return 'Xóa chương và ảnh thành công!';
        };

        toast.promise(deletePromise(), {
            loading: 'Đang xóa chương và dọn dẹp ảnh...',
            success: (msg) => {
                setChapters(prev => prev.filter(c => c._id !== chapter._id));
                return msg || 'Xóa thành công!';
            },
            error: 'Lỗi khi xóa chương.',
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(chapters.map(c => c._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} chương đã chọn và toàn bộ ảnh của chúng?`)) return;

        const chaptersToDelete = chapters.filter(c => selectedIds.includes(c._id));

        const deletePromises = chaptersToDelete.map(async (chapter) => {
            if (mangaName) {
                try {
                    await deleteChapterImagesAPI(mangaName, chapter.number);
                } catch (error) {
                    console.error("Lỗi khi xóa ảnh của chương:", error);
                }
            }
            return deleteChapterAPI(chapter._id);
        });

        toast.promise(Promise.all(deletePromises), {
            loading: `Đang xóa ${selectedIds.length} chương và dọn dẹp ảnh...`,
            success: () => {
                setChapters(prev => prev.filter(c => !selectedIds.includes(c._id)));
                setSelectedIds([]);
                setIsBulkDeleteMode(false);
                return `Xóa ${selectedIds.length} chương thành công!`;
            },
            error: 'Lỗi khi xóa hàng loạt chương.',
        });
    };

    if (isLoading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Quản lý Chương</h1>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-primary">{currentMangaTitle}</h2>
                        {showId && (
                            <span 
                                className="badge badge-ghost font-mono text-xs opacity-70 cursor-pointer select-all"
                                onDoubleClick={() => {
                                    if (mangaId) {
                                        navigator.clipboard.writeText(mangaId);
                                        toast.success("Đã sao chép ID!");
                                    }
                                }}
                                title="Double click để sao chép ID"
                            >
                                ID: {mangaId}
                            </span>
                        )}
                        <button
                            className="btn btn-ghost btn-xs opacity-50 hover:opacity-100 font-bold"
                            onClick={() => setShowId(!showId)}
                        >
                            {showId ? 'Ẩn ID' : 'Hiện ID'}
                        </button>
                    </div>
                    <div>
                        <Link to={`/admin/mangas`} className="text-sm link link-hover text-base-content/60">← Quay lại danh sách truyện</Link>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Bật/Tắt chế độ Xóa hàng loạt */}
                    {isBulkDeleteMode ? (
                        <button 
                            className={`btn btn-md font-bold shadow-md animate-in slide-in-from-right-2 ${selectedIds.length > 0 ? 'btn-error text-white' : 'btn-neutral text-neutral-content'}`}
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
                            className="btn btn-outline btn-error btn-md font-bold"
                            onClick={() => setIsBulkDeleteMode(true)}
                        >
                            <FiTrash2 /> Chọn nhiều
                        </button>
                    )}

                    {/* Nút Sắp xếp */}
                    <select
                        className="select select-bordered select-md"
                        value={sortOrder}
                        onChange={(e) => updateParams({ sort: e.target.value })}
                    >
                        <option value="desc">Sắp xếp: Mới nhất</option>
                        <option value="asc">Sắp xếp: Từ đầu</option>
                    </select>

                    <div className="divider divider-horizontal mx-0 hidden lg:flex"></div>

                    {/* Nút quản lý ảnh */}
                    <button className="btn btn-outline btn-accent btn-md" onClick={() => setIsImageLibraryOpen(true)}>
                        <FiImage /> <span className="hidden sm:inline">Thư Viện Ảnh</span>
                    </button>
                    {/* Nút thêm chương mới */}
                    <button className="btn btn-primary btn-md shadow-lg" onClick={handleOpenAddModal}>
                        <FiPlus /> Thêm Chương Mới
                    </button>
                </div>
            </header>

            {chapters.length === 0 ? (
                <div className="text-center py-16 bg-base-200 rounded-lg">Chưa có chương nào cho truyện này.</div>
            ) : (
                <div className="overflow-x-auto bg-base-100 rounded-box shadow-lg">
                    <table className="table w-full">
                        <thead className='bg-base-300'>
                            <tr>
                                {isBulkDeleteMode && (
                                <th className="w-10">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            className="checkbox" 
                                            onChange={handleSelectAll}
                                            checked={chapters.length > 0 && selectedIds.length === chapters.length}
                                        />
                                    </label>
                                </th>
                                )}
                                <th>Số Chương</th>
                                <th>Tiêu đề</th>
                                <th>Số lượng ảnh</th>
                                <th>Cập nhật gần nhất</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...chapters]
                                .sort((a, b) => sortOrder === 'asc' ? a.number - b.number : b.number - a.number)
                                .map(chapter => (
                                    <tr key={chapter._id} className={`hover ${selectedIds.includes(chapter._id) ? 'bg-base-200' : ''}`}>
                                        {isBulkDeleteMode && (
                                        <th className="w-10">
                                            <label>
                                                <input 
                                                    type="checkbox" 
                                                    className="checkbox" 
                                                    checked={selectedIds.includes(chapter._id)}
                                                    onChange={() => handleSelectRow(chapter._id)}
                                                />
                                            </label>
                                        </th>
                                        )}
                                        <td className="font-bold">{chapter.number}</td>
                                        <td>{chapter.title}</td>
                                        <td>{chapter.images.length}</td>
                                        <td>
                                            <span className="md:hidden">
                                                {new Date(chapter.updatedAt!).toLocaleDateString('vi-VN')}
                                            </span>
                                            <span className="hidden md:inline">
                                                {formatSmartTime(chapter.updatedAt!)}
                                            </span>
                                        </td>
                                        <td className="w-38 text-center">
                                            <div className="flex justify-center items-center gap-1">
                                                {/* Nút Sửa */}
                                                <div className="tooltip" data-tip="Sửa chương">
                                                    <button
                                                        className="btn btn-ghost btn-lg btn-circle"
                                                        onClick={() => handleOpenEditModal(chapter)}
                                                    >
                                                        <FiEdit className="text-info" />
                                                    </button>
                                                </div>

                                                {/* Nút Xóa */}
                                                <div className="tooltip" data-tip="Xóa chương">
                                                    <button
                                                        className="btn btn-ghost btn-lg btn-circle"
                                                        onClick={() => handleDeleteChapter(chapter)}
                                                    >
                                                        <FiTrash2 className="text-error" />
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
            <ChapterModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveChapter}
                initialData={editingChapter}
                mode={modalMode}
                existingChapters={chapters}
                mangaName={mangaName || ''}
            />

            {mangaName && (
                <ImageLibraryModal
                    isOpen={isImageLibraryOpen}
                    onClose={() => setIsImageLibraryOpen(false)}
                    mangaName={mangaName}
                />
            )}
        </div>
    );
};

export default ChapterAdmin;