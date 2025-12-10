/**
 * Chuyển đổi một ngày tháng thành một chuỗi "thời gian đã trôi qua" (ví dụ: "5 phút trước").
 * Hàm này an toàn, xử lý các giá trị đầu vào không hợp lệ và đã được tối ưu.
 *
 * @param dateInput - Chuỗi ngày tháng (ISO string), đối tượng Date, hoặc giá trị null/undefined.
 * @returns Một chuỗi biểu thị thời gian đã trôi qua (ví dụ: "vừa xong", "10 phút trước").
 */
export const formatTimeAgo = (dateInput: string | Date | null | undefined): string => {
  // 1. Kiểm tra đầu vào: Trả về chuỗi rỗng nếu không có dữ liệu
  if (!dateInput) {
    return '';
  }

  // 2. Chuyển đổi và xác thực ngày tháng
  const date = new Date(dateInput);
  // `getTime()` sẽ trả về NaN nếu date không hợp lệ
  if (isNaN(date.getTime())) {
    console.error("Invalid date provided to formatTimeAgo:", dateInput);
    return ''; // Trả về chuỗi rỗng để tránh hiển thị "NaN ngày trước"
  }

  // 3. Tính toán khoảng cách thời gian (bằng giây)
  const now = new Date();
  const diffInSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  // 4. Xử lý trường hợp ngày trong tương lai hoặc chênh lệch rất nhỏ
  if (diffInSeconds < 0) {
    return "sắp tới"; // Hoặc có thể trả về ngày tháng cụ thể
  }
  if (diffInSeconds < 5) {
    return "vừa xong";
  }

  // 5. Định nghĩa các khoảng thời gian để code dễ đọc hơn
  const intervals = {
    năm: 31536000,
    tháng: 2592000,
    ngày: 86400,
    giờ: 3600,
    phút: 60,
    giây: 1,
  };

  // 6. Lặp qua các khoảng thời gian để tìm ra đơn vị phù hợp nhất
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const count = Math.floor(diffInSeconds / secondsInUnit);
    if (count > 0) {
      return `${count} ${unit} trước`;
    }
  }

  return "vừa xong"; // Mặc định nếu chênh lệch quá nhỏ
};

export const formatSmartTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    // Tính khoảng cách thời gian bằng giây
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // 1. Nếu dưới 1 phút
    if (diffInSeconds < 60) {
        return 'Vừa xong';
    }
    
    // 2. Nếu dưới 1 giờ -> Hiển thị phút
    if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)} phút trước`;
    }

    // 3. Nếu dưới 24 giờ -> Hiển thị giờ
    if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    }

    // 4. Kiểm tra xem có phải "Hôm qua" không
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Hôm qua';
    }

    // 5. Còn lại -> Hiển thị ngày tháng năm (VD: 15/05/2024)
    return date.toLocaleDateString('vi-VN');
};