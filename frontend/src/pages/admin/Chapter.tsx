import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getChaptersByMangaIdAPI, createChapterAPI, updateChapterAPI, deleteChapterAPI, type ChapterInput } from '../../api/chapterApi';
import ChapterModal from '../../components/admin/ChapterModal';
import { FiPlus, FiEdit, FiTrash2, FiImage } from 'react-icons/fi';
import ImageLibraryModal from '../../components/admin/ImageLibraryModal';

const ChapterAdmin = () => {
   const { mangaId, mangaName } = useParams<{ mangaId: string, mangaName: string }>(); 
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
     const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);

    useEffect(() => {
        if (!mangaId) return;
        const fetchChapters = async () => {
            try {
                setIsLoading(true);
                const data = await getChaptersByMangaIdAPI(mangaId);
                const sortedData = data.sort((a, b) => a.number - b.number);
                setChapters(sortedData);
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

    const handleDeleteChapter = (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa chương này?')) {
            toast.promise(deleteChapterAPI(id), {
                loading: 'Đang xóa...',
                success: () => {
                    setChapters(prev => prev.filter(c => c._id !== id));
                    return 'Xóa chương thành công!';
                },
                error: 'Lỗi khi xóa chương.',
            });
        }
    };

    if (isLoading) return <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Chương</h1>
                    <Link to={`/admin/mangas`} className="text-sm link link-hover">← Quay lại danh sách truyện</Link>
                </div>
                <div className="flex items-center gap-2">
                    {/* Nút quản lý ảnh */}
                    <button className="btn btn-accent" onClick={() => setIsImageLibraryOpen(true)}>
                        <FiImage /> Thư Viện Ảnh
                    </button>
                    {/* Nút thêm chương mới */}
                    <button className="btn btn-primary" onClick={handleOpenAddModal}>
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
                                <th>Số Chương</th>
                                <th>Tiêu đề</th>
                                <th>Số lượng ảnh</th>
                                <th>Ngày tạo</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chapters.map(chapter => (
                                <tr key={chapter._id} className='hover'>
                                    <td className="font-bold">{chapter.number}</td>
                                    <td>{chapter.title}</td>
                                    <td>{chapter.images.length}</td>
                                    <td>{new Date(chapter.createdAt!).toLocaleDateString()}</td>
                                    <td className="w-38 text-center">
                                        <td className="w-32 text-center"> 
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
                                                        onClick={() => handleDeleteChapter(chapter._id)}
                                                    >
                                                        <FiTrash2 className="text-error" />
                                                    </button>
                                                </div>

                                            </div>
                                        </td>
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