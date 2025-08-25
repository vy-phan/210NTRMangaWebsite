import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiTag, FiSearch } from 'react-icons/fi';
import { createGenreAPI, deleteGenreAPI, getAllGenresAPI, updateGenreAPI } from '../../api/genreApi';
import GenreModal from '../../components/admin/GenreModal';

const GenreAdmin = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Giả lập thời gian tải để thấy spinner
        // await new Promise(resolve => setTimeout(resolve, 1000));
        const data = await getAllGenresAPI();
        setGenres(data);
      } catch (err) {
        setError('Không thể tải danh sách thể loại. Vui lòng thử lại.');
        toast.error('Lỗi khi tải dữ liệu!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);


  const filteredGenres = useMemo(() => {
    if (!searchTerm) {
      return genres; // Trả về danh sách gốc nếu không có từ khóa tìm kiếm
    }
    return genres.filter(genre =>
      genre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      genre.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [genres, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingGenre(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (genre: Genre) => {
    setEditingGenre(genre);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // --- Các hàm xử lý API ---
  const handleSaveGenre = async (genreData: Omit<Genre, '_id' | 'createdAt' | 'updatedAt'>) => {
    const apiCall = modalMode === 'add'
      ? createGenreAPI(genreData)
      : updateGenreAPI(editingGenre!._id, genreData);

    toast.promise(
      apiCall,
      {
        loading: 'Đang lưu...',
        success: (result) => {
          if (modalMode === 'add') {
            setGenres(prev => [...prev, result]);
          } else {
            setGenres(prev => prev.map(g => g._id === result._id ? result : g));
          }
          handleCloseModal();
          return `Lưu thể loại thành công!`;
        },
        error: `Lỗi khi lưu thể loại.`,
      }
    );
  };

  const handleDeleteGenre = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
      toast.promise(
        deleteGenreAPI(id),
        {
          loading: 'Đang xóa...',
          success: () => {
            setGenres(prev => prev.filter(g => g._id !== id));
            return 'Xóa thể loại thành công!';
          },
          error: 'Lỗi khi xóa thể loại.',
        }
      );
    }
  };



  // --- Các Trạng Thái Giao Diện ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{error}</span>
      </div>
    );
  }

  // --- Giao Diện Chính ---

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Thể loại</h1>
          <p className="text-base-content/70 mt-1">Thêm, sửa, hoặc xóa các thể loại truyện.</p>
        </div>
        <button className="btn btn-primary md:btn-md btn-sm" onClick={handleOpenAddModal}>
          <FiPlus />
          Thêm Thể loại Mới
        </button>
      </header>

      <div className="form-control">
        <label className="input input-bordered flex items-center gap-2">
          <FiSearch className="text-base-content/50" />
          <input
            type="text"
            className="grow"
            placeholder="Tìm kiếm theo tên hoặc slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </div>


      {filteredGenres.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-lg">
          <FiTag className="mx-auto text-5xl text-base-content/30 mb-4" />
          <h2 className="text-xl font-semibold">{searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có thể loại nào'}</h2>
          <p className="text-base-content/60 mt-2">
            {searchTerm ? `Không có thể loại nào khớp với "${searchTerm}".` : 'Hãy bắt đầu bằng cách thêm một thể loại mới.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow-lg">
          <table className="table w-full">
            <thead className="text-base bg-base-300">
              <tr>
                <th>STT</th>
                <th>Tên Thể loại</th>
                <th>Slug</th>
                <th>Mô tả</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredGenres.map((genre, index) => (
                <tr key={genre._id} className="hover bg-base-100">
                  <th className="w-16 text-center">{index + 1}</th>
                  <td className="font-bold text-base">{genre.name}</td>
                  <td><div className="badge badge-ghost">{genre.slug}</div></td>
                  <td className="max-w-xs truncate text-base-content/80">{genre.description || <span className="italic text-base-content/50">Không có</span>}</td>
                  <td className="w-32 text-center">
                    <div className="tooltip" data-tip="Sửa">
                      <button className="btn btn-ghost btn-lg btn-circle" onClick={() => handleOpenEditModal(genre)}>
                        <FiEdit className="text-info" />
                      </button>
                    </div>
                    <div className="tooltip" data-tip="Xóa">
                      <button className="btn btn-ghost btn-lg btn-circle" onClick={() => handleDeleteGenre(genre._id)}>
                        <FiTrash2 className="text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GenreModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveGenre}
        initialData={editingGenre}
        mode={modalMode}
      />
    </div>
  );
};

export default GenreAdmin;

