import { openDB } from 'idb';
import type { DBSchema } from 'idb';

interface OfflineDB extends DBSchema {
  chapters: {
    key: [string, number]; // Key là [slug, chapterIndex]
    value: {
      slug: string;
      chapterIndex: number;
      title: string;
      mangaTitle: string;
      images: { pageNumber: number; url: string }[]; // Chỉ lưu URL string
      createdAt: number;
    };
  };
}

const DB_NAME = 'manga-offline-db';
const STORE_NAME = 'chapters';

// Khởi tạo DB
export const initDB = async () => {
  return openDB<OfflineDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: ['slug', 'chapterIndex'] });
      }
    },
  });
};

// Hàm Lưu (Kích hoạt Service Worker Cache)
export const saveChapterOffline = async (
  slug: string, 
  chapterIndex: number, 
  chapterData: any 
) => {
  const db = await initDB();

  // 1. Kích hoạt Cache: Gọi fetch hàng loạt
  // Dùng mode 'no-cors' để không bị lỗi khi tải ảnh từ server lạ
  const cachePromises = chapterData.images.map(async (img: any) => {
      // Thêm tham số time để tránh browser cache cũ, ép SW tải mới
      // const url = img.url; 
      await fetch(img.url, { mode: 'no-cors' });
  });

  // Đợi trình duyệt tải xong hết (Service Worker sẽ tự động cache ngầm)
  await Promise.all(cachePromises);

  // 2. Lưu Metadata vào IndexedDB
  await db.put(STORE_NAME, {
    slug,
    chapterIndex,
    title: chapterData.title,
    mangaTitle: chapterData.manga?.title || 'Unknown',
    images: chapterData.images, // Lưu danh sách URL
    createdAt: Date.now(),
  });
};

// Hàm Lấy
export const getChapterOffline = async (slug: string, chapterIndex: number) => {
  const db = await initDB();
  const record = await db.get(STORE_NAME, [slug, chapterIndex]);
  
  if (!record) return null;

  // Trả về dữ liệu y hệt API (với mảng images chứa URL gốc)
  // Khi <img src="URL_GỐC"> được render, SW sẽ chặn lại và trả về ảnh từ cache
  return {
    ...record,
    manga: { title: record.mangaTitle }
  };
};

// Kiểm tra đã lưu chưa
export const checkChapterSaved = async (slug: string, chapterIndex: number) => {
  const db = await initDB();
  const record = await db.get(STORE_NAME, [slug, chapterIndex]);
  return !!record;
};

export const deleteChapterOffline = async (slug: string, chapterIndex: number) => {
  const db = await initDB();
  
  // Bước 1: Lấy thông tin chương trước khi xóa để biết nó chứa những ảnh nào
  const chapter = await db.get(STORE_NAME, [slug, chapterIndex]);

  if (chapter && chapter.images) {
      try {
          // Bước 2: Mở kho Cache (Tên phải khớp với 'cacheName' trong vite.config.ts)
          const cache = await caches.open('images-cache');
          
          // Bước 3: Duyệt qua từng ảnh và xóa khỏi Cache Storage
          const deletionPromises = chapter.images.map(async (img: any) => {
              // img.url là key để tìm trong cache
              await cache.delete(img.url);
          });

          await Promise.all(deletionPromises);
          console.log(`Đã dọn dẹp ${chapter.images.length} ảnh khỏi bộ nhớ.`);
          
      } catch (error) {
          console.warn("Không thể xóa cache ảnh (có thể do lỗi trình duyệt), nhưng vẫn sẽ xóa trong DB.", error);
      }
  }

  // Bước 4: Xóa metadata trong IndexedDB
  await db.delete(STORE_NAME, [slug, chapterIndex]);
};

// Chỉ xóa cache ảnh truyện
export const clearMangaImageCache = async () => {
  try {
    // Xóa cache ảnh truyện (tên cache phải khớp với vite.config.ts)
    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys.filter(key => key.includes('images-cache')).map(key => caches.delete(key))
    );
    console.log("Đã xóa cache ảnh truyện.");

    return true;
  } catch (error) {
    console.error("Lỗi khi xóa cache ảnh:", error);
    return false;
  }
};


