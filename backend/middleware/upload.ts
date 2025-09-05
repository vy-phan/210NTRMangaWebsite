import multer from 'multer';

// Lưu file vào bộ nhớ tạm (RAM) dưới dạng Buffer
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn mỗi file là 10MB
  }
}).array('images', 50); // Cho phép tối đa 50 files