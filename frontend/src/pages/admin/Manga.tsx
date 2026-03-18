import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiBookOpen, FiSearch } from 'react-icons/fi';
import { getAllMangasAPI, createMangaAPI, updateMangaAPI, deleteMangaAPI, type MangaInput } from '../../api/mangaApi';
import MangaModal from '../../components/admin/MangaModal';
import MangaStatusBadge from '../../components/common/MangaStatusBadge';
import { Link, useSearchParams } from 'react-router-dom';

const MangaAdmin = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL (Normalize to lowercase for UI comparison)
  const searchTerm = searchParams.get('q') || '';
  const filterCategory = searchParams.get('loai')?.toLowerCase() || '';
  const filterStatus = searchParams.get('trang-thai')?.toLowerCase() || '';

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
  const [editingManga, setEditingManga] = useState<Manga | null>(null);


  useEffect(() => {
    const fetchMangas = async () => {
      try {
        setIsLoading(true);
        const data = await getAllMangasAPI();
        setMangas(data);
      } catch (err) {
        setError('Không thể tải danh sách truyện. Vui lòng thử lại.');
        toast.error('Lỗi khi tải dữ liệu!');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMangas();
  }, []);

  const filteredManga = useMemo(() => {
    let list = mangas;

    // 1. Lọc theo từ khóa (giữ nguyên logic cũ)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(manga =>
        manga.title.toLowerCase().includes(q) ||
        manga.slug.toLowerCase().includes(q)
      );
    }

    // 2. Lọc theo Category (THÊM MỚI)
    if (filterCategory) {
      list = list.filter(manga => manga.category?.toLowerCase() === filterCategory);
    }

    // 3. Lọc theo Status (THÊM MỚI)
    if (filterStatus) {
      list = list.filter(manga => manga.status?.toLowerCase() === filterStatus);
    }

    return list;
  }, [mangas, searchTerm, filterCategory, filterStatus]);

  const handleOpenAddModal = () => {
    setEditingManga(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (manga: Manga) => {
    setEditingManga(manga);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveManga = async (mangaData: MangaInput) => {
    const apiCall = modalMode === 'add'
      ? createMangaAPI(mangaData)
      : updateMangaAPI(editingManga!._id, mangaData);

    toast.promise(apiCall, {
      loading: 'Đang lưu truyện...',
      success: (result) => {
        if (modalMode === 'add') {
          setMangas(prev => [result, ...prev]);
        } else {
          setMangas(prev => prev.map(m => m._id === result._id ? result : m));
        }
        handleCloseModal();
        return 'Lưu truyện thành công!';
      },
      error: 'Lỗi khi lưu truyện.',
    });
  };

  const handleDeleteManga = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa truyện này? Hành động này không thể hoàn tác.')) {
      toast.promise(deleteMangaAPI(id), {
        loading: 'Đang xóa truyện...',
        success: () => {
          setMangas(prev => prev.filter(m => m._id !== id));
          return 'Xóa truyện thành công!';
        },
        error: 'Lỗi khi xóa truyện.',
      });
    }
  };


  if (isLoading) return <div className="flex justify-center items-center h-96"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div role="alert" className="alert alert-error"><span>{error}</span></div>;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Truyện</h1>
          <p className="text-base-content/70 mt-1">Tổng cộng: {filteredManga.length} / {mangas.length} truyện.</p>
        </div>

        {/* === CỤM NÚT LỌC VÀ THÊM MỚI (SỬA ĐỔI) === */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Lọc Category */}
          <select
            className="select select-bordered select-md"
            value={filterCategory}
            onChange={(e) => updateParams({ loai: e.target.value })}
          >
            <option value="">Loại: Tất cả</option>
            <option value="manga">🇯🇵 Manga</option>
            <option value="manhwa">🇰🇷 Manhwa</option>
          </select>

          {/* Lọc Status */}
          <select
            className="select select-bordered select-md"
            value={filterStatus}
            onChange={(e) => updateParams({ 'trang-thai': e.target.value })}
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="ongoing">Đang tiến hành</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Nút Xóa bộ lọc (Chỉ hiện khi có lọc) */}
          {(searchTerm || filterCategory || filterStatus) && (
            <button
              className="btn btn-outline btn-error btn-md  gap-2"
              onClick={() => setSearchParams({})}
            >
              <FiTrash2 /> <span className="hidden sm:inline">Xóa bộ lọc</span>
            </button>
          )}

          <div className="divider divider-horizontal mx-0 hidden lg:flex"></div>

          {/* Nút Thêm Mới */}
          <button className="btn btn-primary btn-md shadow-lg" onClick={handleOpenAddModal}>
            <FiPlus /> Thêm Truyện
          </button>
        </div>
      </header>


      <div className="form-control">
        <label className="input input-bordered flex items-center gap-2">
          <FiSearch className="text-base-content/50" />
          <input
            type="text"
            className="grow"
            placeholder="Tìm kiếm theo tên hoặc slug..."
            value={searchTerm}
            onChange={(e) => updateParams({ q: e.target.value })}
          />
        </label>
      </div>

      {filteredManga.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <FiBookOpen className="mx-auto text-5xl text-base-content/30 mb-4" />
          <h2 className="text-xl font-semibold">Chưa có truyện nào</h2>
          <p className="text-base-content/60 mt-2">Hãy bắt đầu bằng cách thêm một truyện mới.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-lg">
          <table className="table w-full">
            <thead className="text-base bg-base-300">
              <tr>
                <th>Poster</th>
                <th>Tên Truyện</th>
                <th>Thể loại</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredManga.map(manga => (
                <tr key={manga._id} className="hover">
                  <td>
                    <div className="avatar">
                      <div className="w-16 rounded">
                        <img src={manga.poster || './place-doro.webp'} alt={manga.title} />
                      </div>
                    </div>
                  </td>
                  <td className="font-bold max-w-xs">
                    {/* Tên truyện */}
                    <span>{manga.title}</span>
                    <br />

                    {/* Link preview */}
                    <a
                      href={`${window.location.origin}/manga/${manga.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-info hover:underline flex items-center gap-1"
                    >
                      {`${window.location.origin}/manga/${manga.slug}`}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>

                    {manga.externalUrl && (
                      <a
                        href={manga.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1 mt-1 opacity-70"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        Nguồn Raw
                      </a>
                    )}
                  </td>
                  <td className="max-w-xs">
                    <div className="flex flex-wrap gap-1 items-center">
                      {manga.genres?.slice(0, 4).map((genre) => (
                        typeof genre !== 'string' && (
                          <div key={genre._id} className="badge badge-outline text-xs whitespace-nowrap">
                            {genre.name}
                          </div>
                        )
                      ))}

                      {(manga.genres?.length || 0) > 4 && (
                        <div className="dropdown dropdown-hover dropdown-right dropdown-end">

                          {/* Nút kích hoạt (+ số lượng) */}
                          <div tabIndex={0} role="button" className="badge badge-ghost badge-xs font-bold cursor-help hover:bg-base-300 transition-colors">
                            +{(manga.genres?.length || 0) - 4}
                          </div>

                          {/* Nội dung xổ ra khi Hover */}
                          <div
                            tabIndex={0}
                            className="dropdown-content z-[50] p-3 shadow-xl bg-base-200 text-base-content rounded-box w-64 border border-base-300"
                          >
                            <div className="text-xs font-bold mb-2 opacity-50 uppercase">Các thể loại khác:</div>
                            <div className="flex flex-wrap gap-2">
                              {manga.genres?.map((genre) => (
                                typeof genre !== 'string' && (
                                  <span key={genre._id} className="badge badge-primary badge-outline badge-sm">
                                    {genre.name}
                                  </span>
                                )
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-outline font-semibold ${manga.category === 'Manga'
                      ? 'badge-info'
                      : 'badge-secondary'
                      }`}>
                      {manga.category || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <MangaStatusBadge status={manga.status} />
                  </td>
                  <td className="w-48 text-center"> {/* Tăng nhẹ độ rộng để chứa 3 nút */}
                    <div className="flex justify-center items-center gap-1">

                      {/* Nút Sửa Truyện */}
                      <div className="tooltip" data-tip="Sửa Truyện">
                        <button
                          className="btn btn-ghost btn-lg btn-circle"
                          onClick={() => handleOpenEditModal(manga)}
                        >
                          <FiEdit className="text-info" />
                        </button>
                      </div>

                      {/* Nút Xóa Truyện */}
                      <div className="tooltip" data-tip="Xóa Truyện">
                        <button
                          className="btn btn-ghost btn-lg btn-circle"
                          onClick={() => handleDeleteManga(manga._id)}
                        >
                          <FiTrash2 className="text-error" />
                        </button>
                      </div>

                      {/* Nút Quản Lý Chương (ĐÃ SỬA) */}
                      <div className="tooltip" data-tip="Quản lý Chương">
                        {/* Sử dụng <Link> thay vì <a> */}
                        <Link
                          to={`/admin/mangas/${manga.slug}/${manga._id}`}
                          className="btn btn-ghost btn-lg btn-circle"
                        >
                          <FiBookOpen className="text-success" />
                        </Link>
                      </div>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MangaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveManga}
        initialData={editingManga}
        mode={modalMode}
      />
    </div>
  );
};

export default MangaAdmin;