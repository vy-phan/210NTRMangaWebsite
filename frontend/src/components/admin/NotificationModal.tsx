import React, { useState, useEffect } from 'react';
import { FiSave, FiX, FiInfo, FiActivity } from 'react-icons/fi';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { content: string; isActive: boolean }) => void;
  initialData: Notification | null;
  mode: 'add' | 'edit';
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setContent(initialData.content);
      setIsActive(initialData.isActive);
    } else {
      setContent('');
      setIsActive(true);
    }
  }, [initialData, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSave({ content, isActive });
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl bg-base-100 rounded-[2rem] border border-base-200 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-transparent p-6 flex justify-between items-center border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl text-primary">
              <FiInfo size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">{mode === 'add' ? 'Tạo thông báo mới' : 'Cập nhật thông báo'}</h3>
              <p className="text-xs text-base-content/60 italic mt-0.5">Hiển thị thông tin quan trọng lên trang chủ.</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Content */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-base flex items-center gap-2">
                <FiInfo className="text-primary" /> Nội dung thông báo
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-40 focus:textarea-primary text-base font-medium transition-all"
              placeholder="Ví dụ: Hệ thống đang nâng cấp bảo trì..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Active Status */}
          <div className="form-control bg-base-200/50 p-4 rounded-2xl border border-base-300">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-lg"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div className="flex flex-col">
                <span className="label-text font-bold flex items-center gap-2">
                  <FiActivity className="text-success" /> Trạng thái kích hoạt
                </span>
                <span className="label-text-alt text-base-content/50">Khi bật, thông báo này sẽ hiển thị ngay lập tức lên Header.</span>
              </div>
            </label>
          </div>

          {/* Warning */}
          <div className="alert alert-info bg-info/5 border-info/20 rounded-2xl py-3 shadow-inner">
            <FiInfo size={18} className="text-info" />
            <span className="text-xs font-bold text-info italic">Lưu ý: Hệ thống chỉ hiển thị một thông báo Active mới nhất.</span>
          </div>

          {/* Actions */}
          <div className="modal-action mt-8 flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-ghost rounded-xl flex-1 border border-base-300">
              Hủy
            </button>
            <button type="submit" className="btn btn-primary rounded-xl flex-[2] shadow-lg shadow-primary/20 gap-2">
              <FiSave /> {mode === 'add' ? 'Tạo thông báo' : 'Lưu cập nhật'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
    </div>
  );
};

export default NotificationModal;
