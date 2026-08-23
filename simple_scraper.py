import os
import io
import re
import time
import threading
import ctypes
import requests
from bs4 import BeautifulSoup
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog

# Hỗ trợ hiển thị sắc nét trên Windows (High DPI)
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    pass


class SimpleDamCoNuongScraper:
    def __init__(self, log_callback):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        self.log = log_callback

    def get_images(self, url):
        """Lấy danh sách URL ảnh từ trang chương"""
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            image_urls = []
            for img in soup.select('#chapter-content img'):
                img_url = img.get('data-original-src') or img.get('data-src') or img.get('src')
                if img_url:
                    img_url = img_url.strip()
                    if img_url.startswith('//'): 
                        img_url = 'https:' + img_url
                    image_urls.append(img_url)
            
            return image_urls
        except Exception as e:
            self.log(f"   [!] Lỗi khi cào URL {url}: {e}")
            return []

    def download_images(self, image_urls, output_dir, file_prefix, start_number=1):
        """Tải ảnh thô về với đánh số tiếp theo"""
        if not image_urls:
            return 0

        # Đảm bảo thư mục lưu tồn tại
        os.makedirs(output_dir, exist_ok=True)

        success_count = 0
        for idx, img_url in enumerate(image_urls, start=start_number):
            try:
                resp = requests.get(img_url, headers=self.headers, timeout=15)
                resp.raise_for_status()
                
                # Đặt tên file: <prefix>part<number>.jpg
                filename = f"{file_prefix}part{idx}.jpg"
                save_path = os.path.join(output_dir, filename)
                
                # Lưu ảnh thô
                with open(save_path, 'wb') as f:
                    f.write(resp.content)
                
                success_count += 1
                self.log(f"   [+] Đã tải: {filename}")
                
            except Exception as e:
                self.log(f"   [!] Lỗi tải ảnh {idx}: {e}")
                continue

        return success_count

    def get_next_part_number(self, output_dir, file_prefix):
        """Đếm số ảnh hiện có trong thư mục để xác định số bắt đầu tiếp theo"""
        if not os.path.exists(output_dir):
            return 1
        
        # Tìm tất cả file khớp với pattern prefixpart<number>.jpg
        pattern = re.compile(rf'^{re.escape(file_prefix)}part(\d+)\.jpg$')
        max_number = 0
        
        for filename in os.listdir(output_dir):
            match = pattern.match(filename)
            if match:
                number = int(match.group(1))
                if number > max_number:
                    max_number = number
        
        # Nếu có file thì tiếp tục từ số tiếp theo, nếu không thì bắt đầu từ 1
        return max_number + 1 if max_number > 0 else 1

    def extract_slug_from_url(self, url):
        """Trích xuất slug từ URL damconuong"""
        # URL pattern: https://damconuong.sbs/truyen/slug-truyen/chapter-1
        match = re.search(r'/truyen/([^/]+)/', url)
        if match:
            return match.group(1)
        return "unknown"


class SimpleMangaDownloaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Simple Manga Downloader - Raw Images")
        self.root.geometry("720x650")
        self.root.configure(padx=15, pady=15)

        # Biến điều khiển tiến trình
        self.is_paused = False
        self.is_stopped = False

        # Biến giao diện
        self.base_url_var = tk.StringVar(value="https://damconuong.sbs/truyen/ikenie-no-haha/chapter-")
        self.save_dir_var = tk.StringVar(value=os.path.join(os.path.expanduser("~"), "Downloads"))
        self.start_idx_var = tk.StringVar(value="1")
        self.end_idx_var = tk.StringVar(value="5")

        self.create_widgets()

    def create_widgets(self):
        # Frame Cấu hình lưu trữ
        save_frame = ttk.LabelFrame(self.root, text="Thư Mục Lưu Ảnh", padding=(10, 10))
        save_frame.pack(fill="x", pady=(0, 10))

        ttk.Entry(save_frame, textvariable=self.save_dir_var, width=60).grid(row=0, column=0, padx=(0, 5), pady=5, sticky="ew")
        ttk.Button(save_frame, text="📁 Chọn Thư Mục", command=self.select_directory).grid(row=0, column=1, pady=5)
        save_frame.columnconfigure(0, weight=1)

        # Frame Cấu hình cào dữ liệu
        scrape_frame = ttk.LabelFrame(self.root, text="Thông Tin Tải Truyện", padding=(10, 10))
        scrape_frame.pack(fill="x", pady=(0, 10))

        ttk.Label(scrape_frame, text="Base URL:").grid(row=0, column=0, sticky="w", pady=5)
        ttk.Entry(scrape_frame, textvariable=self.base_url_var, width=60).grid(row=0, column=1, pady=5, columnspan=3, sticky="ew")

        ttk.Label(scrape_frame, text="Chương Bắt Đầu:").grid(row=1, column=0, sticky="w", pady=5)
        ttk.Entry(scrape_frame, textvariable=self.start_idx_var, width=15).grid(row=1, column=1, pady=5, sticky="w")

        ttk.Label(scrape_frame, text="Chương Kết Thúc:").grid(row=1, column=2, sticky="w", pady=5, padx=(10, 0))
        ttk.Entry(scrape_frame, textvariable=self.end_idx_var, width=15).grid(row=1, column=3, pady=5, sticky="w")
        scrape_frame.columnconfigure(1, weight=1)

        # Frame Nút điều khiển
        button_frame = ttk.Frame(self.root)
        button_frame.pack(pady=10)

        self.start_btn = ttk.Button(button_frame, text="🚀 BẮT ĐẦU CHẠY", command=self.start_process)
        self.start_btn.pack(side="left", padx=5)

        self.clear_btn = ttk.Button(button_frame, text="🧹 XÓA LOG", command=self.clear_log)
        self.clear_btn.pack(side="left", padx=5)

        # Khung Log hiển thị tiến trình
        ttk.Label(self.root, text="Tiến trình xử lý:").pack(anchor="w")
        self.log_text = scrolledtext.ScrolledText(self.root, height=18, state='disabled', bg="#1e1e1e", fg="#00ff66", font=("Consolas", 10))
        self.log_text.pack(fill="both", expand=True, pady=(5, 0))

    def select_directory(self):
        folder = filedialog.askdirectory(initialdir=self.save_dir_var.get(), title="Chọn thư mục lưu ảnh")
        if folder:
            self.save_dir_var.set(folder)

    def write_log(self, message):
        """Hàm cập nhật log an toàn (có thể gọi từ thread phụ)"""
        self.root.after(0, self._write_log, message)

    def _write_log(self, message):
        self.log_text.config(state='normal')
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state='disabled')

    def clear_log(self):
        """Xóa toàn bộ nội dung trong khung Log"""
        self.log_text.config(state='normal')
        self.log_text.delete('1.0', tk.END)
        self.log_text.config(state='disabled')

    def start_process(self):
        # Validate dữ liệu đầu vào
        try:
            start_idx = int(self.start_idx_var.get().strip())
            end_idx = int(self.end_idx_var.get().strip())
        except ValueError:
            messagebox.showerror("Lỗi", "Chương bắt đầu và kết thúc phải là số nguyên!")
            return
        
        if not self.base_url_var.get() or "..." in self.base_url_var.get():
            messagebox.showerror("Lỗi", "Vui lòng nhập Base URL hợp lệ!")
            return

        # Disable nút ấn để tránh click nhiều lần
        self.start_btn.config(state='disabled')
        
        # Reset flags
        self.is_paused = False
        self.is_stopped = False
        
        # Chạy logic trong Thread riêng để không làm đơ giao diện
        thread = threading.Thread(target=self.run_scraping_loop, args=(start_idx, end_idx))
        thread.daemon = True
        thread.start()

    def run_scraping_loop(self, start_idx, end_idx):
        self.write_log(f"=== SIMPLE MANGA DOWNLOADER ===")
        self.write_log(f"🚀 BẮT ĐẦU TẢI TỪ CHƯƠNG {start_idx} ĐẾN {end_idx}\n")

        scraper = SimpleDamCoNuongScraper(log_callback=self.write_log)
        base_url = self.base_url_var.get().strip()
        save_dir = self.save_dir_var.get().strip()

        success_count = 0
        fail_count = 0

        # Trích xuất slug từ URL để đặt tên file
        sample_url = f"{base_url}{start_idx}"
        slug = scraper.extract_slug_from_url(sample_url)
        file_prefix = f"{slug}-"

        self.write_log(f"📌 Slug truyện: {slug}")
        self.write_log(f"📌 Thư mục lưu: {save_dir}")
        self.write_log(f"📌 Tiền tố file: {file_prefix}\n")

        # Kiểm tra số ảnh hiện có để tiếp tục đánh số
        next_part_number = scraper.get_next_part_number(save_dir, file_prefix)
        self.write_log(f"📌 Bắt đầu đánh số từ: part{next_part_number}\n")

        for i in range(start_idx, end_idx + 1):
            if self.is_stopped:
                self.write_log("⏹️ Đã dừng bởi người dùng.")
                break

            while self.is_paused:
                time.sleep(0.1)
                if self.is_stopped:
                    break

            if self.is_stopped:
                break

            url = f"{base_url}{i}"
            self.write_log(f"👉 Đang xử lý Chương {i}...")
            self.write_log(f"   - URL: {url}")
            
            # 1. Cào URL ảnh
            image_urls = scraper.get_images(url)
            if not image_urls:
                self.write_log(f"   [!] Bỏ qua chương {i} vì không tìm thấy ảnh.")
                fail_count += 1
                continue
            
            self.write_log(f"   [+] Tìm thấy {len(image_urls)} ảnh.")

            # 2. Tải ảnh thô với đánh số tiếp theo
            downloaded = scraper.download_images(image_urls, save_dir, file_prefix, next_part_number)
            
            if downloaded > 0:
                self.write_log(f"   ✅ Đã tải {downloaded}/{len(image_urls)} ảnh.")
                success_count += 1
                next_part_number += downloaded  # Cập nhật số tiếp theo
            else:
                self.write_log(f"   ❌ Không tải được ảnh nào.")
                fail_count += 1
            
            # Nghỉ 1 chút để tránh bị block
            time.sleep(1)

        self.write_log(f"\n=== HOÀN THÀNH ===")
        self.write_log(f"🏆 Tổng cộng: {success_count} chương thành công, {fail_count} chương thất bại.")
        
        # Bật lại nút sau khi chạy xong
        self.root.after(0, lambda: self.start_btn.config(state='normal'))
        messagebox.showinfo("Hoàn thành", f"Đã chạy xong!\nThành công: {success_count} | Thất bại: {fail_count}")


if __name__ == "__main__":
    # Khởi tạo GUI
    root = tk.Tk()
    app = SimpleMangaDownloaderApp(root)
    root.mainloop()
