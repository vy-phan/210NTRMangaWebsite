// Thời gian tương đối tiếng Việt: vừa xong, X phút trước, ... X năm trước
export const relativeTime = (input: number | string | Date | undefined | null): string => {
  if (!input) return '';
  const t = input instanceof Date ? input.getTime() : typeof input === 'number' ? input : new Date(input).getTime();
  if (!t || Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
};

export const absoluteDate = (input: string | Date | undefined | null): string => {
  if (!input) return '';
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Nhãn chương để hiển thị: "Chương " + chapterTitle (link vẫn theo chapterNumber)
export const chapterLabel = (number: number, title?: string | null): string => {
  const t = (title || '').trim();
  if (!t) return `Chương ${number}`;
  if (/^\d+$/.test(t)) return `Chương ${t}`;
  // Title đã chứa sẵn tiền tố chương thì không ghép thêm
  if (/^(chương|chapter|chap\.?|ch\.?|tập)\b/i.test(t)) return t;
  return `Chương ${t}`;
};

// Trạng thái truyện → nhãn tiếng Việt
export const statusLabel = (status?: string): string => {
  switch (status) {
    case 'Ongoing': return 'Đang tiến hành';
    case 'Completed': return 'Hoàn thành';
    case 'Cancelled': return 'Đã hủy';
    case 'Hiatus': return 'Tạm ngưng';
    default: return status || 'Chưa rõ';
  }
};

// Nhóm lịch sử theo ngày
export type HistoryGroup = 'today' | 'yesterday' | 'older';

export const groupOf = (timestamp: number): HistoryGroup => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  if (timestamp >= startOfToday) return 'today';
  if (timestamp >= startOfYesterday) return 'yesterday';
  return 'older';
};

export const GROUP_LABEL: Record<HistoryGroup, string> = {
  today: 'Hôm nay',
  yesterday: 'Hôm qua',
  older: 'Cũ hơn',
};
