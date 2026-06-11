import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiUser } from 'react-icons/fi';

const TOTAL_AVATARS = 25;

interface AvatarSelectionModalProps {
    modalRef: React.RefObject<HTMLDialogElement>;
    currentAvatar: string;
    currentName: string; // Thêm prop này để hiển thị tên hiện tại
    onSave: (newAvatarUrl: string, newDisplayName: string) => void; // Cập nhật hàm trả về 2 giá trị
}

const AvatarSelectionModal = ({ modalRef, currentAvatar, currentName, onSave }: AvatarSelectionModalProps) => {
    const avatarList = Array.from({ length: TOTAL_AVATARS }, (_, i) => `/avatar/${i + 1}.webp`);

    // State quản lý Avatar và Tên hiển thị
    const [selectedAvatar, setSelectedAvatar] = useState<string>('');
    const [name, setName] = useState<string>('');

    // Mỗi khi modal mở hoặc props thay đổi, reset state về giá trị hiện tại
    useEffect(() => {
        // Reset Avatar
        if (currentAvatar && currentAvatar.includes('/avatar/')) {
            setSelectedAvatar(currentAvatar);
        } else {
            setSelectedAvatar('');
        }

        // Reset Tên
        setName(currentName || '');
    }, [currentAvatar, currentName]);

    const handleClose = () => {
        modalRef.current?.close();
        // Reset lại dữ liệu nếu người dùng bấm Hủy (để lần sau mở lên không bị lưu cái cũ)
        if (currentAvatar && currentAvatar.includes('/avatar/')) {
            setSelectedAvatar(currentAvatar);
        }
        setName(currentName || '');
    };

    const handleConfirm = () => {
        // Gửi cả avatar và tên về cho component cha xử lý
        onSave(selectedAvatar, name);
        modalRef.current?.close();
    };

    return (
        <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4 text-center">Chỉnh sửa hồ sơ</h3>

                {/* --- PHẦN 1: NHẬP TÊN HIỂN THỊ --- */}
                <div className="form-control w-full mb-4">
                    <label className="label">
                        <span className="label-text font-semibold flex items-center gap-2">
                            <FiUser /> Tên hiển thị
                        </span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập tên hiển thị mới..."
                        className="input input-bordered w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="divider text-xs text-base-content/60">Và chọn ảnh đại diện</div>

                {/* --- PHẦN 2: CHỌN AVATAR (LƯỚI ẢNH) --- */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {avatarList.map((url, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedAvatar(url)}
                            className={`
                                cursor-pointer rounded-full p-1 transition-all duration-200 relative group
                                ${selectedAvatar === url
                                    ? 'ring-4 ring-primary scale-105'
                                    : 'hover:scale-105 hover:ring-2 hover:ring-base-300 opacity-80 hover:opacity-100'}
                            `}
                        >
                            <div className="avatar w-full">
                                <div className="w-full rounded-full bg-base-200 overflow-hidden">
                                    <img 
                                        src={url} 
                                        alt={`Avatar ${index + 1}`} 
                                        loading="lazy" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Dấu tích xanh khi được chọn */}
                            {selectedAvatar === url && (
                                <div className="absolute top-0 right-0 bg-primary text-white rounded-full p-1 shadow-md">
                                    <FiCheck size={12} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-xs text-center text-base-content/60 mt-4">
                    Chọn một hình ảnh từ danh sách có sẵn
                </p>

                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={handleClose}>
                        <FiX /> Hủy
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleConfirm}
                        disabled={!name.trim()} // Không cho lưu nếu tên rỗng
                    >
                        <FiCheck /> Lưu thay đổi
                    </button>
                </div>
            </div>

            {/* Click backdrop to close */}
            <form method="dialog" className="modal-backdrop">
                <button onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
};

export default AvatarSelectionModal;