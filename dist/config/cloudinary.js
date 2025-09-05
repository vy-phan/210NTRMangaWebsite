"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = exports.bufferToDataURI = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
const parser_1 = __importDefault(require("datauri/parser"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Cấu hình Cloudinary SDK
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});
const parser = new parser_1.default();
/**
 * Chuyển đổi một Buffer (từ Multer) thành chuỗi Data URI.
 * @param {Express.Multer.File} file - Đối tượng file từ Multer.
 * @returns {string | undefined} Chuỗi Data URI.
 */
const bufferToDataURI = (file) => {
    return parser.format(path_1.default.extname(file.originalname).toString(), file.buffer).content;
};
exports.bufferToDataURI = bufferToDataURI;
/**
 * Upload file ảnh lên Cloudinary với tối ưu hóa cho truyện tranh.
 * @param {string} fileStr - Chuỗi Data URI của ảnh.
 * @param {string} folderName - Đường dẫn thư mục trên Cloudinary (vd: 'mangas/oshi-no-ko/chapter-123').
 * @returns {Promise<UploadApiResponse>} Kết quả đầy đủ từ Cloudinary.
 */
const uploadToCloudinary = (fileStr, folderName) => {
    return cloudinary_1.v2.uploader.upload(fileStr, {
        folder: folderName,
        transformation: [
            { quality: 'auto:good', fetch_format: 'auto' }
        ]
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Xóa một tài sản khỏi Cloudinary bằng public_id.
 * @param {string} publicId - public_id của tài sản cần xóa.
 */
const deleteFromCloudinary = (publicId) => {
    return cloudinary_1.v2.uploader.destroy(publicId);
};
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=cloudinary.js.map