import os
import io
import re
import time
import threading
import ctypes
import requests
from bs4 import BeautifulSoup
from PIL import Image
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog

# Hỗ trợ hiển thị sắc nét trên Windows (High DPI)
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    pass

# Giới hạn chiều cao an toàn cho ảnh WebP (Chuẩn WebP tối đa 16383px)
MAX_WEBP_HEIGHT = 14000 


class DamCoNuongDownloader:
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

    def download_image(self, img_url):
        """Tải ảnh đơn lẻ về RAM và chuyển thành đối tượng PIL Image"""
        try:
            resp = requests.get(img_url, headers=self.headers, timeout=15)
            resp.raise_for_status()
            img = Image.open(io.BytesIO(resp.content))
            # Chuyển đổi sang RGB nếu ảnh gốc ở hệ màu RGBA hoặc P để tối ưu WebP
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            return img
        except Exception as e:
            self.log(f"   [!] Lỗi tải ảnh: {img_url} ({e})")
            return None

    def merge_and_save_webp(self, images, output_dir, file_prefix):
        """Ghép và tự động cắt lát nếu ảnh quá giới hạn WebP (Quality 85%)"""
        if not images:
            return 0

        # Đảm bảo thư mục lưu tồn tại
        os.makedirs(output_dir, exist_ok=True)

        # 1. Lấy chiều rộng chuẩn (giới hạn tối đa 16000px theo chuẩn WebP)
        target_width = min(images[0].width, MAX_WEBP_HEIGHT)

        # 2. Resize tất cả ảnh về cùng chiều rộng chuẩn theo tỉ lệ gốc
        normalized_images = []
        for img in images:
            if img.width != target_width:
                scale_ratio = target_width / img.width
                new_height = int(img.height * scale_ratio)
                resized_img = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
                normalized_images.append(resized_img)
            else:
                normalized_images.append(img)

        # 3. CẮT LÁT (SLICE): Nếu có tấm ảnh đơn nào cao vượt MAX_WEBP_HEIGHT, cắt nhỏ nó ra
        safe_sliced_images = []
        for img in normalized_images:
            if img.height > MAX_WEBP_HEIGHT:
                for top in range(0, img.height, MAX_WEBP_HEIGHT):
                    bottom = min(top + MAX_WEBP_HEIGHT, img.height)
                    crop_img = img.crop((0, top, img.width, bottom))
                    safe_sliced_images.append(crop_img)
            else:
                safe_sliced_images.append(img)

        # 4. Gom nhóm các lát ảnh lại thành các file dài tối đa MAX_WEBP_HEIGHT
        chunks = []
        current_chunk = []
        current_height = 0

        for img in safe_sliced_images:
            if current_chunk and (current_height + img.height > MAX_WEBP_HEIGHT):
                chunks.append((current_chunk, current_height))
                current_chunk = [img]
                current_height = img.height
            else:
                current_chunk.append(img)
                current_height += img.height

        if current_chunk:
            chunks.append((current_chunk, current_height))

        # 5. Ghép và lưu ra file .webp vào thư mục chương tương ứng
        saved_count = 0
        for part_idx, (chunk, total_h) in enumerate(chunks, start=1):
            stitched_img = Image.new('RGB', (target_width, total_h), (255, 255, 255))
            y_offset = 0
            for img in chunk:
                stitched_img.paste(img, (0, y_offset))
                y_offset += img.height

            # Đặt tên file: <slug_truyen>_<chapter>_part_<số>.webp
            filename = f"{file_prefix}_part_{part_idx:02d}.webp"
            save_path = os.path.join(output_dir, filename)

            # Lưu WebP với chất lượng nén 85%
            stitched_img.save(save_path, 'WEBP', quality=85)
            saved_count += 1

        return saved_count


class MangaDownloaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Manga Batch Downloader & WebP Stitcher")
        self.root.geometry("720x750")
        self.root.configure(padx=15, pady=15)

        # Biến điều khiển tiến trình
        self.is_paused = False
        self.is_stopped = False

        # Biến giao diện
        self.base_url_var = tk.StringVar(value="https://damconuong.sbs/truyen/thoa-thuan-day-toi-loi-vi-bong-hong-sat-vach/chapter-")
        self.save_dir_var = tk.StringVar(value=os.path.join(os.path.expanduser("~"), "Downloads"))
        self.start_idx_var = tk.StringVar(value="1")
        self.end_idx_var = tk.StringVar(value="5")

        self.create_widgets()

    def create_widgets(self):
        # Frame Cấu hình lưu trữ
        save_frame = ttk.LabelFrame(self.root, text="Thư Mục Gốc Lưu Truyện", padding=(10, 10))
        save_frame.pack(fill="x", pady=(0, 10))

        ttk.Entry(save_frame, textvariable=self.save_dir_var, width=60).grid(row=0, column=0, padx=(0, 5), pady=5, sticky="ew")
        ttk.Button(save_frame, text="📁 Chọn Thư Mục", command=self.select_directory).grid(row=0, column=1, pady=5)
        save_frame.columnconfigure(0, weight=1)

        # Frame Cấu hình cào dữ liệu
        scrape_frame = ttk.LabelFrame(self.root, text="Thông Tin Cào Truyện", padding=(10, 10))
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

        self.pause_btn = ttk.Button(button_frame, text="⏸️ TẠM DỪNG", state="disabled", command=self.toggle_pause)
        self.pause_btn.pack(side="left", padx=5)

        self.stop_btn = ttk.Button(button_frame, text="🛑 DỪNG HẲN", state="disabled", command=self.stop_process)
        self.stop_btn.pack(side="left", padx=5)

        self.clear_btn = ttk.Button(button_frame, text="🧹 XÓA LOG", command=self.clear_log)
        self.clear_btn.pack(side="left", padx=5)

        # Khung Log hiển thị tiến trình
        ttk.Label(self.root, text="Tiến trình xử lý:").pack(anchor="w")
        self.log_text = scrolledtext.ScrolledText(self.root, height=18, state='disabled', bg="#1e1e1e", fg="#00ff66", font=("Consolas", 10))
        self.log_text.pack(fill="both", expand=True, pady=(5, 0))

    def select_directory(self):
        folder = filedialog.askdirectory(initialdir=self.save_dir_var.get(), title="Chọn thư mục gốc lưu truyện")
        if folder:
            self.save_dir_var.set(folder)

    def write_log(self, message):
        self.root.after(0, self._write_log, message)

    def _write_log(self, message):
        self.log_text.config(state='normal')
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state='disabled')

    def clear_log(self):
        self.log_text.config(state='normal')
        self.log_text.delete('1.0', tk.END)
        self.log_text.config(state='disabled')

    def extract_file_prefix(self, url):
        """Trích xuất slug truyện và chapter từ URL"""
        match = re.search(r'/truyen/([^/]+)/(chapter-[\d\.]+)', url)
        if match:
            return f"{match.group(1)}_{match.group(2)}"
        clean_url = url.rstrip('/').split('/')
        return f"{clean_url[-2]}_{clean_url[-1]}" if len(clean_url) >= 2 else "manga_chapter"

    def toggle_pause(self):
        """Xử lý tạm dừng hoặc tiếp tục"""
        if not self.is_paused:
            self.is_paused = True
            self.pause_btn.config(text="▶️ TIẾP TỤC")
            self.write_log("⏸️ [ĐÃ TẠM DỪNG] Đang tạm dừng tải...")
        else:
            self.is_paused = False
            self.pause_btn.config(text="⏸️ TẠM DỪNG")
            self.write_log("▶️ [TIẾP TỤC] Đang tiếp tục quá trình...")

    def stop_process(self):
        """Dừng hoàn toàn tiến trình"""
        self.is_stopped = True
        self.is_paused = False
        self.write_log("🛑 Đang gửi lệnh dừng chương trình...")

    def start_process(self):
        try:
            start_idx = int(self.start_idx_var.get().strip())
            end_idx = int(self.end_idx_var.get().strip())
            if start_idx > end_idx:
                messagebox.showerror("Lỗi", "Chương bắt đầu phải nhỏ hơn hoặc bằng chương kết thúc!")
                return
        except ValueError:
            messagebox.showerror("Lỗi", "Chương bắt đầu và kết thúc phải là số nguyên!")
            return

        save_dir = self.save_dir_var.get().strip()
        if not os.path.isdir(save_dir):
            messagebox.showerror("Lỗi", "Thư mục lưu trữ không tồn tại!")
            return

        base_url = self.base_url_var.get().strip()
        if not base_url or "..." in base_url:
            messagebox.showerror("Lỗi", "Vui lòng nhập Base URL hợp lệ!")
            return

        # Đặt lại cờ điều khiển
        self.is_paused = False
        self.is_stopped = False

        # Cập nhật trạng thái các nút
        self.start_btn.config(state='disabled')
        self.pause_btn.config(state='normal', text="⏸️ TẠM DỪNG")
        self.stop_btn.config(state='normal')

        thread = threading.Thread(target=self.run_download_loop, args=(start_idx, end_idx, base_url, save_dir))
        thread.daemon = True
        thread.start()

    def run_download_loop(self, start_idx, end_idx, base_url, save_dir):
        self.write_log("=== BẮT ĐẦU QUÁ TRÌNH TẢI VÀ GHÉP ẢNH WEBP ===")
        self.write_log(f"📁 Thư mục gốc: {save_dir}")
        self.write_log(f"📖 Xử lý từ chương {start_idx} đến chương {end_idx}\n")

        downloader = DamCoNuongDownloader(log_callback=self.write_log)
        success_chap = 0
        fail_chap = 0

        for i in range(start_idx, end_idx + 1):
            # Kiểm tra nếu người dùng bấm dừng hẳn
            if self.is_stopped:
                self.write_log("🛑 Đã dừng toàn bộ tiến trình theo yêu cầu.")
                break

            # Kiểm tra tạm dừng
            while self.is_paused:
                if self.is_stopped:
                    break
                time.sleep(0.5)

            if self.is_stopped:
                self.write_log("🛑 Đã dừng toàn bộ tiến trình theo yêu cầu.")
                break

            chapter_url = f"{base_url}{i}"
            file_prefix = self.extract_file_prefix(chapter_url)

            # 👉 TẠO FOLDER RIÊNG BIỆT CHO TỪNG CHƯƠNG (VD: Chapter 38)
            chapter_folder_name = f"Chapter {i}"
            chapter_save_dir = os.path.join(save_dir, chapter_folder_name)
            os.makedirs(chapter_save_dir, exist_ok=True)

            self.write_log(f"👉 [Chương {i}] Đang lấy danh sách ảnh: {chapter_url}")
            img_urls = downloader.get_images(chapter_url)

            if not img_urls:
                self.write_log(f"   [!] Bỏ qua chương {i} do không tìm thấy ảnh.")
                fail_chap += 1
                continue

            self.write_log(f"   [+] Tìm thấy {len(img_urls)} ảnh. Đang tải về...")

            pil_images = []
            for idx, img_url in enumerate(img_urls, start=1):
                # Kiểm tra dừng/tạm dừng ngay cả trong lúc tải từng ảnh
                if self.is_stopped:
                    break
                while self.is_paused:
                    if self.is_stopped:
                        break
                    time.sleep(0.5)

                img = downloader.download_image(img_url)
                if img:
                    pil_images.append(img)

            if self.is_stopped:
                self.write_log("🛑 Đã dừng toàn bộ tiến trình theo yêu cầu.")
                break

            if not pil_images:
                self.write_log(f"   ❌ Tải ảnh thất bại toàn bộ cho chương {i}.")
                fail_chap += 1
                continue

            self.write_log(f"   ⚙️ Đang xử lý ghép lát WebP an toàn (Chất lượng 85%)...")
            try:
                # Lưu vào thư mục riêng của chương (chapter_save_dir)
                saved_parts = downloader.merge_and_save_webp(pil_images, chapter_save_dir, file_prefix)
                self.write_log(f"   ✅ Hoàn tất chương {i}: Đã tạo {saved_parts} file WebP tại thư mục '{chapter_folder_name}'.")
                success_chap += 1
            except Exception as e:
                self.write_log(f"   ❌ Lỗi khi ghép ảnh chương {i}: {e}")
                fail_chap += 1

            time.sleep(0.5)

        self.write_log("\n=== KẾT THÚC TIẾN TRÌNH ===")
        self.write_log(f"🏆 Thành công: {success_chap} chương | Thất bại: {fail_chap} chương.")

        # Khôi phục trạng thái giao diện
        self.root.after(0, self.reset_ui_state)

        if not self.is_stopped:
            messagebox.showinfo("Hoàn tất", f"Đã hoàn thành!\nThành công: {success_chap} chương\nThất bại: {fail_chap} chương")
        else:
            messagebox.showwarning("Đã Dừng", "Tiến trình đã được dừng lại!")

    def reset_ui_state(self):
        self.start_btn.config(state='normal')
        self.pause_btn.config(state='disabled', text="⏸️ TẠM DỪNG")
        self.stop_btn.config(state='disabled')
        self.is_paused = False
        self.is_stopped = False


if __name__ == "__main__":
    root = tk.Tk()
    app = MangaDownloaderApp(root)
    root.mainloop()