import React from 'react';

// Định nghĩa các kiểu trạng thái có thể có
type MangaStatus = 'Ongoing' | 'Completed' | 'Cancelled' | string | undefined;

interface MangaStatusBadgeProps {
  status: MangaStatus;
}

// Tạo một "từ điển" để ánh xạ từ khóa sang thông tin hiển thị
const statusMap = {
  Ongoing: {
    text: 'Đang tiến hành',
    className: 'badge-warning badge-outline',
  },
  Completed: {
    text: 'Đã hoàn thành',
    className: 'badge-success badge-outline',
  },
  Cancelled: {
    text: 'Đã hủy',
    className: 'badge-error badge-outline',
  },
  // Thêm một trường hợp mặc định để xử lý các giá trị không mong muốn
  default: {
    text: 'Không rõ',
    className: 'badge-ghost badge-outline',
  }
};

const MangaStatusBadge: React.FC<MangaStatusBadgeProps> = ({ status }) => {
  // Lấy thông tin hiển thị từ "từ điển"
  // Nếu status không hợp lệ, nó sẽ lấy giá trị 'default'
  const displayInfo = (status && statusMap[status as keyof typeof statusMap]) || statusMap.default;

  return (
    <span className={`badge ${displayInfo.className}`}>
      {displayInfo.text}
    </span>
  );
};

export default MangaStatusBadge;