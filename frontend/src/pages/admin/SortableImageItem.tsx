import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {  FiAlignJustify, FiTrash2 } from 'react-icons/fi';

interface SortableImageItemProps {
  id: string; // dnd-kit cần một ID duy nhất, chúng ta sẽ dùng index
  url: string;
  index: number;
  onUrlChange: (index: number, url: string) => void;
  onRemove: (index: number) => void;
  isRemoveDisabled: boolean;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({ id, url, index, onUrlChange, onRemove, isRemoveDisabled }) => {
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
      {/* Handle để kéo thả */}
      <button type="button" {...listeners} {...attributes} className="btn btn-ghost btn-sm px-2 cursor-grab active:cursor-grabbing">
        <FiAlignJustify />
      </button>
      
      {/* Số thứ tự */}
      <span className="font-mono p-2 bg-base-200 rounded-md">{index + 1}</span>
      
      {/* Input URL */}
      <input
        type="url"
        placeholder="https://example.com/image.jpg"
        value={url}
        onChange={(e) => onUrlChange(index, e.target.value)}
        required
        className="input input-bordered grow"
      />
      
      
      {/* Nút xóa */}
      <button type="button" onClick={() => onRemove(index)} className="btn btn-ghost btn-circle btn-sm" disabled={isRemoveDisabled}>
        <FiTrash2 className="text-error" />
      </button>
    </div>
  );
};

export default SortableImageItem;