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