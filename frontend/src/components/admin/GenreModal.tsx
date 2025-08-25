import { useState, useEffect } from 'react';
import { FiTag, FiType, FiSave, FiX } from 'react-icons/fi'; 
import { slugify } from '../../utils/slugify';

interface GenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (genre: Omit<Genre, '_id' | 'createdAt' | 'updatedAt'>) => void;
  initialData: Genre | null;
  mode: 'add' | 'edit';
}

const GenreModal = ({ isOpen, onClose, onSave, initialData, mode }: GenreModalProps) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);
  const generatedSlug = slugify(formData.name);

  useEffect(() => {
    if (isOpen && mode === 'edit' && initialData) {
      setFormData({ name: initialData.name, description: initialData.description || '' });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [isOpen, mode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      onSave({ ...formData, slug: generatedSlug });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog id="genre_modal" className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box p-0">
        {/* 1. Cải thiện Header Modal */}
        <header className="p-6 bg-base-200 rounded-t-box">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <FiTag />
            {mode === 'add' ? 'Thêm Thể loại Mới' : `Chỉnh sửa: ${initialData?.name}`}
          </h3>
          <p className="text-sm text-base-content/60 mt-1">Điền thông tin chi tiết cho thể loại.</p>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* 2. Nâng cấp Input với Icon */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Tên Thể loại</span>
              <span className="label-text-alt text-error">* Bắt buộc</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <FiType className="text-base-content/40" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Tình Cảm, Lãng Mạn"
                className="grow"
                required
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Slug</span></label>
            <input
              type="text"
              value={generatedSlug}
              className="input input-bordered w-full bg-base-200/50 cursor-not-allowed"
              readOnly
              aria-label="Slug tự động tạo"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-semibold">Mô tả</span></label>
            <br/>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered h-24"
              placeholder="Mô tả ngắn gọn về thể loại này..."
            ></textarea>
          </div>

          {/* 3. Phân tách khu vực hành động (nút bấm) */}
          <div className="divider"></div>
          <div className="modal-action mt-0">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>
              <FiX /> Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? <span className="loading loading-spinner"></span> : <FiSave />}
              Lưu Thay đổi
            </button>
          </div>
        </form>
      </div>
      {/* Backdrop, khi bấm vào sẽ đóng modal */}
      <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
    </dialog>
  );
};

export default GenreModal;