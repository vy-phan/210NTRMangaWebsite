import os
import io
import re
import time
import threading
import ctypes
import requests
from PIL import Image
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
from playwright.sync_api import sync_playwright

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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://damconuong.pet/'
        }
        self.log = log_callback
        
        # Khởi tạo Chromium chạy ẩn ngầm để tự thực thi JavaScript giải mã ảnh
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=True)
        self.context = self.browser.new_context(
            user_agent=self.headers['User-Agent'],
            extra_http_headers={'Referer': 'https://damconuong.pet/'}
        )

    def close(self):
        """Đóng sạch sẽ tiến trình trình duyệt ngầm khi xong"""
        try:
            self.context.close()
            self.browser.close()
            self.playwright.stop()
        except Exception:
            pass

    def get_images(self, url):
        """Dùng Headless Chromium chờ mã JS giải mã ảnh ra thẻ img"""
        page = None
        try:
            page = self.context.new_page()
            # Mở trang chương
            page.goto(url, timeout=30000, wait_until="domcontentloaded")
            
            # Đợi file bookmark.js giải mã và chèn thẻ img vào DOM (tối đa 12 giây)
            try:
                page.wait_for_selector("#chapter-content img, .chapter-img", timeout=12000)
            except Exception:
                pass

            # Trích xuất tất cả URL ảnh thực tế sau khi giải mã
            image_urls = page.evaluate("""
                () => {
                    const imgs = document.querySelectorAll('#chapter-content img, .chapter-img');
                    const urls = [];
                    imgs.forEach(img => {
                        const src = img.getAttribute('data-src') || img.getAttribute('src');
                        // Loại trừ ảnh SVG placeholder (data:image/svg...)
                        if (src && !src.startsWith('data:image') && !src.includes('svg')) {
                            urls.push(src.trim());
                        }
                    });
                    return urls;
                }
            """)
            return image_urls
        except Exception as e:
            self.log(f"   [!] Lỗi khi cào URL {url}: {e}")
            return []
        finally:
            if page:
                try:
                    page.close()
                except Exception:
                    pass

    def download_image(self, img_url):
        """Tải ảnh đơn lẻ về RAM (có kèm Referer để tránh 403 Forbidden)"""
        try:
            resp = requests.get(img_url, headers=self.headers, timeout=15)
            resp.raise_for_status()
            img = Image.open(io.BytesIO(resp.content))
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

        os.makedirs(output_dir, exist_ok=True)

        # 1. Lấy chiều rộng chuẩn
        target_width = min(images[0].width, MAX_WEBP_HEIGHT)

        # 2. Resize tất cả ảnh về cùng chiều rộng chuẩn
        normalized_images = []
        for img in images:
            if img.width != target_width:
                scale_ratio = target_width / img.width
                new_height = int(img.height * scale_ratio)
                resized_img = img.resize((target_width, new_height), Image.Resampling.LANCZOS)
                normalized_images.append(resized_img)
            else:
                normalized_images.append(img)

        # 3. CẮT LÁT nếu có ảnh đơn cao hơn giới hạn
        safe_sliced_images = []
        for img in normalized_images:
            if img.height > MAX_WEBP_HEIGHT:
                for top in range(0, img.height, MAX_WEBP_HEIGHT):
                    bottom = min(top + MAX_WEBP_HEIGHT, img.height)
                    crop_img = img.crop((0, top, img.width, bottom))
                    safe_sliced_images.append(crop_img)
            else:
                safe_sliced_images.append(img)

        # 4. Gom nhóm các lát ảnh lại
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

        # 5. Lưu ra file .webp
        saved_count = 0
        for part_idx, (chunk, total_h) in enumerate(chunks, start=1):
            stitched_img = Image.new('RGB', (target_width, total_h), (255, 255, 255))
            y_offset = 0
            for img in chunk:
                stitched_img.paste(img, (0, y_offset))
                y_offset += img.height

            filename = f"{file_prefix}_part_{part_idx:02d}.webp"
            save_path = os.path.join(output_dir, filename)
            stitched_img.save(save_path, 'WEBP', quality=85)
            saved_count += 1

        return saved_count


class MangaDownloaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Manga Batch Downloader & WebP Stitcher")
        self.root.geometry("720x750")
        self.root.configure(padx=15, pady=15)

        self.is_paused = False
        self.is_stopped = False

        self.base_url_var = tk.StringVar(value="https://damconuong.pet/truyen/thoa-thuan-day-toi-loi-vi-bong-hong-sat-vach/chapter-")
        self.save_dir_var = tk.StringVar(value=os.path.join(os.path.expanduser("~"), "Downloads"))
        self.start_idx_var = tk.StringVar(value="61")
        self.end_idx_var = tk.StringVar(value="63")

        self.create_widgets()

    def create_widgets(self):
        save_frame = ttk.LabelFrame(self.root, text="Thư Mục Gốc Lưu Truyện", padding=(10, 10))
        save_frame.pack(fill="x", pady=(0, 10))

        ttk.Entry(save_frame, textvariable=self.save_dir_var, width=60).grid(row=0, column=0, padx=(0, 5), pady=5, sticky="ew")
        ttk.Button(save_frame, text="📁 Chọn Thư Mục", command=self.select_directory).grid(row=0, column=1, pady=5)
        save_frame.columnconfigure(0, weight=1)

        scrape_frame = ttk.LabelFrame(self.root, text="Thông Tin Cào Truyện", padding=(10, 10))
        scrape_frame.pack(fill="x", pady=(0, 10))

        ttk.Label(scrape_frame, text="Base URL:").grid(row=0, column=0, sticky="w", pady=5)
        ttk.Entry(scrape_frame, textvariable=self.base_url_var, width=60).grid(row=0, column=1, pady=5, columnspan=3, sticky="ew")

        ttk.Label(scrape_frame, text="Chương Bắt Đầu:").grid(row=1, column=0, sticky="w", pady=5)
        ttk.Entry(scrape_frame, textvariable=self.start_idx_var, width=15).grid(row=1, column=1, pady=5, sticky="w")

        ttk.Label(scrape_frame, text="Chương Kết Thúc:").grid(row=1, column=2, sticky="w", pady=5, padx=(10, 0))
        ttk.Entry(scrape_frame, textvariable=self.end_idx_var, width=15).grid(row=1, column=3, pady=5, sticky="w")
        scrape_frame.columnconfigure(1, weight=1)

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
        match = re.search(r'/truyen/([^/]+)/(chapter-[\d\.]+)', url)
        if match:
            return f"{match.group(1)}_{match.group(2)}"
        clean_url = url.rstrip('/').split('/')
        return f"{clean_url[-2]}_{clean_url[-1]}" if len(clean_url) >= 2 else "manga_chapter"

    def toggle_pause(self):
        if not self.is_paused:
            self.is_paused = True
            self.pause_btn.config(text="▶️ TIẾP TỤC")
            self.write_log("⏸️ [ĐÃ TẠM DỪNG] Đang tạm dừng tải...")
        else:
            self.is_paused = False
            self.pause_btn.config(text="⏸️ TẠM DỪNG")
            self.write_log("▶️ [TIẾP TỤC] Đang tiếp tục quá trình...")

    def stop_process(self):
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
        if not base_url:
            messagebox.showerror("Lỗi", "Vui lòng nhập Base URL hợp lệ!")
            return

        self.is_paused = False
        self.is_stopped = False

        self.start_btn.config(state='disabled')
        self.pause_btn.config(state='normal', text="⏸️ TẠM DỪNG")
        self.stop_btn.config(state='normal')

        thread = threading.Thread(target=self.run_download_loop, args=(start_idx, end_idx, base_url, save_dir))
        thread.daemon = True
        thread.start()

    def run_download_loop(self, start_idx, end_idx, base_url, save_dir):
        # ⚙️ Tự động chuẩn hóa Base URL (cắt bỏ số chương và dấu gạch chéo thừa ở đuôi nếu người dùng dán nhầm cả link chương)
        base_url = re.sub(r'(\d+)/?$', '', base_url.strip())
        if not base_url.endswith('-') and not base_url.endswith('/'):
            base_url += '-'

        self.write_log("=== BẮT ĐẦU QUÁ TRÌNH TẢI VÀ GHÉP ẢNH WEBP ===")
        self.write_log(f"📁 Thư mục gốc: {save_dir}")
        self.write_log(f"📖 Xử lý từ chương {start_idx} đến chương {end_idx}")
        self.write_log("🌐 Khởi tạo trình duyệt ngầm Playwright để giải mã ảnh JS...")

        downloader = None
        success_chap = 0
        fail_chap = 0

        try:
            downloader = DamCoNuongDownloader(log_callback=self.write_log)

            for i in range(start_idx, end_idx + 1):
                if self.is_stopped:
                    self.write_log("🛑 Đã dừng toàn bộ tiến trình theo yêu cầu.")
                    break

                while self.is_paused:
                    if self.is_stopped:
                        break
                    time.sleep(0.5)

                if self.is_stopped:
                    self.write_log("🛑 Đã dừng toàn bộ tiến trình theo yêu cầu.")
                    break

                chapter_url = f"{base_url}{i}"
                file_prefix = self.extract_file_prefix(chapter_url)

                chapter_folder_name = f"Chapter {i}"
                chapter_save_dir = os.path.join(save_dir, chapter_folder_name)
                os.makedirs(chapter_save_dir, exist_ok=True)

                self.write_log(f"\n👉 [Chương {i}] Đang lấy danh sách ảnh: {chapter_url}")
                img_urls = downloader.get_images(chapter_url)

                if not img_urls:
                    self.write_log(f"   [!] Bỏ qua chương {i} do không tìm thấy ảnh (hoặc chưa kịp load JS).")
                    fail_chap += 1
                    continue

                self.write_log(f"   [+] Tìm thấy {len(img_urls)} ảnh sau khi giải mã. Bắt đầu tải...")

                pil_images = []
                for idx, img_url in enumerate(img_urls, start=1):
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
                    saved_parts = downloader.merge_and_save_webp(pil_images, chapter_save_dir, file_prefix)
                    self.write_log(f"   ✅ Hoàn tất chương {i}: Đã tạo {saved_parts} file WebP tại thư mục '{chapter_folder_name}'.")
                    success_chap += 1
                except Exception as e:
                    self.write_log(f"   ❌ Lỗi khi ghép ảnh chương {i}: {e}")
                    fail_chap += 1

                time.sleep(0.5)

        except Exception as e:
            self.write_log(f"❌ Có lỗi bất ngờ xảy ra: {e}")
        finally:
            if downloader:
                downloader.close()

        self.write_log("\n=== KẾT THÚC TIẾN TRÌNH ===")
        self.write_log(f"🏆 Thành công: {success_chap} chương | Thất bại: {fail_chap} chương.")

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