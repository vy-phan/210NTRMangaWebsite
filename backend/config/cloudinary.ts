import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';
import DatauriParser from 'datauri/parser';
import path from 'path';

dotenv.config();

// Cấu hình Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const parser = new DatauriParser();





/**
 * Chuyển đổi một Buffer (từ Multer) thành chuỗi Data URI.
 * @param {Express.Multer.File} file - Đối tượng file từ Multer.
 * @returns {string | undefined} Chuỗi Data URI.
 */
export const bufferToDataURI = (file: Express.Multer.File): string | undefined => {
  return parser.format(path.extname(file.originalname).toString(), file.buffer).content;
};





/**
 * Upload file ảnh lên Cloudinary với tối ưu hóa cho truyện tranh.
 * @param {string} fileStr - Chuỗi Data URI của ảnh.
 * @param {string} folderName - Đường dẫn thư mục trên Cloudinary (vd: 'mangas/oshi-no-ko/chapter-123').
 * @returns {Promise<UploadApiResponse>} Kết quả đầy đủ từ Cloudinary.
 */
export const uploadToCloudinary = (fileStr: string, folderName: string): Promise<UploadApiResponse> => {
  return cloudinary.uploader.upload(fileStr, {
    folder: folderName,
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' }
    ]
  });
};




/**
 * Xóa một tài sản khỏi Cloudinary bằng public_id.
 * @param {string} publicId - public_id của tài sản cần xóa.
 */
export const deleteFromCloudinary = (publicId: string): Promise<any> => {
  return cloudinary.uploader.destroy(publicId);
};