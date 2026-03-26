import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_SECRET || 'manga-hentai-web-default-key-2026';
const PEPPER = "manga_app_sys_3.0_ntr_secret"; // Hạt muối trộn vào dữ liệu gốc

export const secureStorage = {
  getItem: (name: string): string | null => {
    try {
      const data = localStorage.getItem(name);
      if (!data) return null;

      // 1. Loại bỏ 12 ký tự rác ở đầu và 10 ký tự ở đuôi
      const encryptedValue = data.substring(12, data.length - 10);

      // 2. Giải mã bằng AES
      const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
      const decryptedWithPepper = bytes.toString(CryptoJS.enc.Utf8);

      // 3. Kiểm tra và loại bỏ Pepper
      if (decryptedWithPepper.startsWith(PEPPER)) {
        return decryptedWithPepper.slice(PEPPER.length);
      }
      return null;
    } catch {
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      // 1. Trộn Pepper vào dữ liệu
      const dataToEncrypt = PEPPER + value;

      // 2. Mã hóa AES
      const encryptedValue = CryptoJS.AES.encrypt(dataToEncrypt, SECRET_KEY).toString();

      // 3. Thêm vỏ bọc rác ngẫu nhiên để làm sai lệch định dạng Base64
      const head = "v1-cache-" + Math.random().toString(36).substring(2, 5); // 12 ký tự
      const tail = "-sys-" + Math.random().toString(36).substring(2, 7); // 10 ký tự
      const finalValue = head + encryptedValue + tail;

      localStorage.setItem(name, finalValue);
    } catch {
      // Yên lặng khi có lỗi ở Production
    }
  },

  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  }
};

