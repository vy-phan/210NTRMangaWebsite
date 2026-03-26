import requests
from bs4 import BeautifulSoup
import time
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import threading

class DamCoNuongScraper:
    def __init__(self, log_callback):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        self.log = log_callback # Hàm dùng để in log ra giao diện

    def get_images(self, url):
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            image_urls =[]
            for img in soup.select('#chapter-content img'):
                img_url = img.get('data-original-src') or img.get('data-src') or img.get('src')
                if img_url:
                    img_url = img_url.strip()
                    if img_url.startswith('//'): 
                        img_url = 'https:' + img_url
                    image_urls.append(img_url)
            
            return image_urls
        except Exception as e:
            self.log(f"   [!] Lỗi khi cào {url}: {e}")
            return[]

    def post_to_backend(self, payload, backend_url, access_token):
        headers = {
            'Authorization': f'Bearer {access_token.strip()}',
            'Content-Type': 'application/json'
        }
        try:
            response = requests.post(backend_url, json=payload, headers=headers)
            if response.status_code == 201:
                return True, response.json()
            else:
                return False, response.text
        except Exception as e:
            return False, str(e)


class MangaUploaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Manga Auto Uploader")
        self.root.geometry("650x700")
        self.root.configure(padx=20, pady=20)

        # === BIẾN LƯU TRỮ DỮ LIỆU ===
        self.manga_id_var = tk.StringVar(value="694524a54cd2040d3b759423")
        self.backend_url_var = tk.StringVar(value="https://ntrmanga.onrender.com/api/chapters")
        self.token_var = tk.StringVar(value="")
        self.base_url_var = tk.StringVar(value="https://damconuong.app/truyen/.../chapter-")
        self.start_idx_var = tk.StringVar(value="1")
        self.end_idx_var = tk.StringVar(value="5")

        self.create_widgets()

    def create_widgets(self):
        # Frame cho cấu hình
        config_frame = ttk.LabelFrame(self.root, text="Cấu Hình Hệ Thống", padding=(10, 10))
        config_frame.pack(fill="x", pady=(0, 10))

        # Manga ID
        ttk.Label(config_frame, text="Manga ID:").grid(row=0, column=0, sticky="w", pady=5)
        ttk.Entry(config_frame, textvariable=self.manga_id_var, width=50).grid(row=0, column=1, pady=5)

        # Backend URL (Combobox cho phép chọn 2 option)
        ttk.Label(config_frame, text="Backend URL:").grid(row=1, column=0, sticky="w", pady=5)
        url_options =[
            "https://ntrmanga.onrender.com/api/chapters",
            "http://localhost:5000/api/chapters"
        ]
        url_combo = ttk.Combobox(config_frame, textvariable=self.backend_url_var, values=url_options, width=47)
        url_combo.grid(row=1, column=1, pady=5)

        # Token
        ttk.Label(config_frame, text="Access Token:").grid(row=2, column=0, sticky="w", pady=5)
        ttk.Entry(config_frame, textvariable=self.token_var, width=50).grid(row=2, column=1, pady=5)

        # Frame cho thông tin cào dữ liệu
        scrape_frame = ttk.LabelFrame(self.root, text="Thông Tin Chạy Tool", padding=(10, 10))
        scrape_frame.pack(fill="x", pady=(0, 10))

        # Base URL
        ttk.Label(scrape_frame, text="Base URL:").grid(row=0, column=0, sticky="w", pady=5)
        ttk.Entry(scrape_frame, textvariable=self.base_url_var, width=50).grid(row=0, column=1, pady=5, columnspan=3)

        # Start Index
        ttk.Label(scrape_frame, text="Chương Bắt Đầu:").grid(row=1, column=0, sticky="w", pady=5)
        ttk.Entry(scrape_frame, textvariable=self.start_idx_var, width=15).grid(row=1, column=1, pady=5, sticky="w")

        # End Index
        ttk.Label(scrape_frame, text="Chương Kết Thúc:").grid(row=1, column=2, sticky="w", pady=5, padx=(10, 0))
        ttk.Entry(scrape_frame, textvariable=self.end_idx_var, width=15).grid(row=1, column=3, pady=5, sticky="w")

        # Nút Bắt đầu
        self.start_btn = ttk.Button(self.root, text="🚀 BẮT ĐẦU CHẠY", command=self.start_process)
        self.start_btn.pack(pady=10)

        # Khung Log hiển thị tiến trình
        ttk.Label(self.root, text="Log Hoạt Động:").pack(anchor="w")
        self.log_text = scrolledtext.ScrolledText(self.root, height=15, state='disabled', bg="black", fg="white")
        self.log_text.pack(fill="both", expand=True)

    def write_log(self, message):
        """Hàm cập nhật log an toàn (có thể gọi từ thread phụ)"""
        self.root.after(0, self._write_log, message)

    def _write_log(self, message):
        self.log_text.config(state='normal')
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
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
        
        # Chạy logic trong Thread riêng để không làm đơ giao diện
        thread = threading.Thread(target=self.run_scraping_loop, args=(start_idx, end_idx))
        thread.daemon = True
        thread.start()

    def run_scraping_loop(self, start_idx, end_idx):
        self.write_log(f"=== BATCH MANGA UPLOADER ===")
        self.write_log(f"🚀 BẮT ĐẦU CHẠY TỪ CHƯƠNG {start_idx} ĐẾN {end_idx}\n")

        scraper = DamCoNuongScraper(log_callback=self.write_log)
        manga_id = self.manga_id_var.get().strip()
        backend_url = self.backend_url_var.get().strip()
        token = self.token_var.get().strip()
        base_url = self.base_url_var.get().strip()

        success_count = 0
        fail_count = 0

        for i in range(start_idx, end_idx + 1):
            url = f"{base_url}{i}"
            chapter_title = str(i)
            chapter_number = i - 1  # Logic index = title - 1

            self.write_log(f"👉 Đang xử lý Chương {chapter_title}...")
            self.write_log(f"   - URL: {url}")
            
            # 1. Cào ảnh
            image_urls = scraper.get_images(url)
            if not image_urls:
                self.write_log(f"   [!] Bỏ qua chương {chapter_title} vì không tìm thấy ảnh.")
                fail_count += 1
                continue
            
            self.write_log(f"   [+] Tìm thấy {len(image_urls)} ảnh.")

            # 2. Tạo payload
            payload = {
                "number": chapter_number,
                "title": chapter_title,
                "manga": manga_id,
                "images":[{"url": u, "pageNumber": idx+1} for idx, u in enumerate(image_urls)]
            }

            # 3. Gửi lên Backend
            success, result = scraper.post_to_backend(payload, backend_url, token)
            if success:
                self.write_log(f"   ✅ Thành công!")
                success_count += 1
            else:
                self.write_log(f"   ❌ Thất bại: {result}")
                fail_count += 1
            
            # Nghỉ 1 chút
            time.sleep(1)

        self.write_log(f"\n=== HOÀN THÀNH ===")
        self.write_log(f"🏆 Tổng cộng: {success_count} thành công, {fail_count} thất bại.")
        
        # Bật lại nút sau khi chạy xong
        self.root.after(0, lambda: self.start_btn.config(state='normal'))
        messagebox.showinfo("Hoàn thành", f"Đã chạy xong!\nThành công: {success_count} | Thất bại: {fail_count}")

if __name__ == "__main__":
    # Khởi tạo GUI
    root = tk.Tk()
    app = MangaUploaderApp(root)
    root.mainloop()