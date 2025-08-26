import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {  FiColumns, FiTrash2 } from 'react-icons/fi'; // Đổi lại icon cho phù hợp

interface SortableImageItemProps {
  id: string; 
  url: string;
  pageNumber: number; // <<-- THÊM PROP NÀY
  index: number; // Vẫn cần index để cập nhật đúng phần tử
  onUrlChange: (index: number, url: string) => void;
  onRemove: (index: number) => void;
  isRemoveDisabled: boolean;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({ id, url, pageNumber, index, onUrlChange, onRemove, isRemoveDisabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-base-100 p-2 rounded-lg">
      <button type="button" {...listeners} {...attributes} className="btn btn-ghost btn-sm px-2 cursor-grab active:cursor-grabbing">
        <FiColumns />
      </button>
      
      {/* === SỬA LẠI Ở ĐÂY === */}
      {/* Hiển thị `pageNumber` gốc thay vì `index + 1` */}
      <span className="font-mono p-2 bg-base-200 rounded-md">{pageNumber}</span> 
      
      <input
        type="url"
        placeholder="https://example.com/image.jpg"
        value={url}
        // Truyền `index` vào hàm onUrlChange để nó biết vị trí trong mảng
        onChange={(e) => onUrlChange(index, e.target.value)}
        required
        className="input input-bordered grow"
      />
      
      {url && (
        <div className="avatar">
          <div className="w-12 rounded">
            <img src={url} alt={`Preview ${pageNumber}`} referrerPolicy="no-referrer" />
          </div>
        </div>
      )}
      
      <button type-="button" onClick={() => onRemove(index)} className="btn btn-ghost btn-circle btn-sm" disabled={isRemoveDisabled}>
        <FiTrash2 className="text-error" />
      </button>
    </div>
  );
};

export default SortableImageItem;