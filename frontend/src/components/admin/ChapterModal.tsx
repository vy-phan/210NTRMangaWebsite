import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { FiPlus, FiSave, FiX } from 'react-icons/fi';
import SortableImageItem from '../../pages/admin/SortableImageItem';

interface ChapterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (chapter: any) => void;
    initialData: Chapter | null;
    mode: 'add' | 'edit';
    existingChapters: Chapter[]; // <<-- Thêm prop này
}

const ChapterModal = ({ isOpen, onClose, onSave, initialData, mode, existingChapters }: ChapterModalProps) => {
    const [formData, setFormData] = useState({
        number: 0,
        title: '',
        images: [] as { url: string; pageNumber: number }[],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);


    const [numImagesToAdd, setNumImagesToAdd] = useState(1);

    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && initialData) {
                // Logic khi sửa (không đổi)
                const sortedImages = [...initialData.images].sort((a, b) => a.pageNumber - b.pageNumber);
                setFormData({
                    number: initialData.number,
                    title: initialData.title,
                    images: sortedImages,
                });
            } else {
                // === LOGIC TỰ ĐỘNG ĐIỀN SỐ CHƯƠNG KHI THÊM MỚI ===
                // 1. Tìm số chương lớn nhất hiện có
                const maxChapterNumber = existingChapters.length > 0
                    ? Math.max(...existingChapters.map(c => c.number))
                    : -1; // Nếu chưa có chương nào, coi như số lớn nhất là -1

                // 2. Số chương mới sẽ là số lớn nhất + 1
                const nextChapterNumber = maxChapterNumber + 1;

                // 3. Reset form với số chương mới
                setFormData({ number: nextChapterNumber, title: '', images: [{ url: '', pageNumber: 1 }] });
            }
        }
    }, [isOpen, mode, initialData, existingChapters]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'number' ? Math.max(0, Number(value)) : value }));
    };

    const handleImageChange = (index: number, url: string) => {
        const newImages = [...formData.images];
        newImages[index].url = url;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        // Lấy số trang cuối cùng hiện có
        const lastPageNumber = formData.images.length > 0
            ? Math.max(...formData.images.map(img => img.pageNumber))
            : 0;

        // Tạo ra một mảng các ô nhập mới
        const newFields = Array.from({ length: numImagesToAdd }, (_, i) => ({
            url: '',
            pageNumber: lastPageNumber + i + 1,
        }));

        // Thêm các ô nhập mới vào cuối danh sách
        setFormData(prev => ({ ...prev, images: [...prev.images, ...newFields] }));

        // Reset lại số lượng về 1 cho lần thêm tiếp theo
        setNumImagesToAdd(1);
    };

    const removeImageField = (index: number) => {
        if (formData.images.length <= 1) return;
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    // === Logic của DND-KIT ===
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFormData((prev) => {
                const oldIndex = prev.images.findIndex((img) => img.pageNumber.toString() === active.id);
                const newIndex = prev.images.findIndex((img) => img.pageNumber.toString() === over.id);
                
                if (oldIndex === -1 || newIndex === -1) return prev; 

                return { ...prev, images: arrayMove(prev.images, oldIndex, newIndex) };
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Gán lại `pageNumber` theo đúng thứ tự hiện tại của mảng TRƯỚC KHI LƯU
        const finalImages = formData.images.map((img, index) => ({ 
            url: img.url, 
            pageNumber: index + 1 
        }));
        
        // Gửi đi dữ liệu đã được cập nhật
        onSave({ ...formData, images: finalImages });
        setIsSaving(false);
    };

    if (!isOpen) return null;


    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box w-11/12 max-w-2xl">
                <header className="p-4 border-b border-base-300">
                    <h3 className="font-bold text-lg">{mode === 'add' ? 'Thêm Chương Mới' : 'Chỉnh Sửa Chương'}</h3>
                </header>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Số Chương</span></label>
                            <input
                                type="number"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                required
                                min="0"
                                className="input input-bordered"
                                onKeyDown={(e) => {
                                    if (e.key === '-') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Tiêu đề Chương</span></label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input input-bordered" />
                        </div>
                    </div>

                    {/* Dynamic Image Fields */}
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Danh sách ảnh (kéo thả để sắp xếp)</span></label>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                           <SortableContext
                                items={formData.images.map(image => image.pageNumber.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-2">
                                    {formData.images.map((image, index) => (
                                        <SortableImageItem
                                            // Dùng `pageNumber` làm key và id vì nó là duy nhất
                                            key={image.pageNumber}
                                            id={image.pageNumber.toString()}
                                            url={image.url}
                                            pageNumber={image.pageNumber} // Truyền pageNumber gốc
                                            index={index} // Vẫn truyền index để update đúng vị trí trong mảng
                                            onUrlChange={handleImageChange}
                                            onRemove={removeImageField}
                                            isRemoveDisabled={formData.images.length <= 1}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                        <div className="join w-full mt-3">
                            <input
                                type="number"
                                className="input input-bordered join-item w-24"
                                min="1"
                                max="100" // Giới hạn để tránh treo máy
                                value={numImagesToAdd}
                                onChange={(e) => setNumImagesToAdd(Math.max(1, Number(e.target.value)))}
                            />
                            <button
                                type="button"
                                onClick={addImageField}
                                className="btn btn-outline join-item flex-grow"
                            >
                                <FiPlus /> Thêm {numImagesToAdd} Ảnh
                            </button>
                        </div>
                    </div>

                    {/* Sử dụng component collapse của DaisyUI */}
                    <div tabIndex={0} className={`collapse collapse-arrow border border-base-300 bg-base-200 rounded-b-box ${isPreviewOpen ? 'collapse-open' : ''}`}>
                        <div className="collapse-title text-xl font-medium" onClick={() => setIsPreviewOpen(!isPreviewOpen)}>
                            Xem trước nội dung chương
                        </div>
                        <div className="collapse-content bg-black/80">
                            <div className="max-h-[70vh] overflow-y-auto p-4 flex flex-col items-center space-y-2">
                                {formData.images.map((image, index) => (
                                    // Chỉ render preview nếu có URL hợp lệ
                                    image.url && (
                                        <div key={`preview-${index}`} className="text-center">
                                            <p className="text-white/70 font-mono text-sm mb-1">- {index + 1} -</p>
                                            <img
                                                src={image.url}
                                                alt={`Page ${index + 1}`}
                                                className="max-w-full h-auto rounded"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                    )
                                ))}
                                {formData.images.every(img => !img.url) && (
                                    <p className="text-white/50 p-8">Chưa có ảnh nào để xem trước.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-action pt-4 border-t border-base-300">
                        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSaving}>
                            <FiX /> Hủy
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? <span className="loading loading-spinner"></span> : <FiSave />}
                            Lưu Chương
                        </button>
                    </div>


                </form>
            </div>
            <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
        </dialog>
    );
};

export default ChapterModal;