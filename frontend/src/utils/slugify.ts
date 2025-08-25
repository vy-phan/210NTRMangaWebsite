export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD') // Chuẩn hóa Unicode (tách dấu)
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu thanh
    .toLowerCase() // Chuyển thành chữ thường
    .trim() // Xóa khoảng trắng đầu cuối
    .replace(/\s+/g, '-') // Thay thế khoảng trắng bằng gạch ngang
    .replace(/[^\w-]+/g, '') // Xóa các ký tự không phải chữ, số, gạch ngang
    .replace(/--+/g, '-'); // Thay thế nhiều gạch ngang liền nhau bằng một
};