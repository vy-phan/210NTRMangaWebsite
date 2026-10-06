import os
import re
import time
import threading
import ctypes
import requests
import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
from playwright.sync_api import sync_playwright

# Hỗ trợ hiển thị sắc nét trên Windows (High DPI)
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    pass


class DamCoNuongDownloader:
    def __init__(self, log_callback):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://damconuong.pet/'
        }
        self.log = log_callback
        
        # Khởi tạo Playwright Chromium chạy ngầm
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=True)
        self.context = self.browser.new_context(
            user_agent=self.headers['User-Agent'],
            extra_http_headers={'Referer': 'https://damconuong.pet/'}
        )

    def close(self):
        """Đóng an toàn trình duyệt"""
        try:
            self.context.close()
            self.browser.close()
            self.playwright.stop()
        except Exception:
            pass

    def get_images(self, url):
        """Chờ Javascript giải mã danh sách ảnh vào DOM"""
        page = None
        try:
            page = self.context.new_page()
            page.goto(url, timeout=30000, wait_until="domcontentloaded")
            
            # Chờ ảnh render ra thẻ img (tối đa 12 giây)
            try:
                page.wait_for_selector("#chapter-content img, .chapter-img", timeout=12000)
            except Exception:
                pass

            # Lấy toàn bộ link ảnh hợp lệ
            image_urls = page.evaluate("""
                () => {
                    const imgs = document.querySelectorAll('#chapter-content img, .chapter-img');
                    const urls = [];
                    imgs.forEach(img => {
                        const src = img.getAttribute('data-src') || img.getAttribute('src');
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

    def download_and_save_image(self, img_url, save_path):
        """Tải trực tiếp byte ảnh về đĩa cứng"""
        try:
            resp = requests.get(img_url, headers=self.headers, timeout=20)
            resp.raise_for_status()
            with open(save_path, 'wb') as f:
                f.write(resp.content)
            return True
        except Exception as e:
            self.log(f"   [!] Lỗi tải ảnh {img_url}: {e}")
            return False


class MangaDownloaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Manga Downloader - Tải List Ảnh Rời")
        self.root.geometry("720x720")
        self.root.configure(padx=15, pady=15)

        self.is_paused = False
        self.is_stopped = False

        self.base_url_var = tk.StringVar(value="https://damconuong.pet/truyen/good-wife/oneshot")
        self.save_dir_var = tk.StringVar(value=os.path.join(os.path.expanduser("~"), "Downloads"))
        self.start_idx_var = tk.StringVar(value="1")
        self.end_idx_var = tk.StringVar(value="1")

        self.create_widgets()

    def create_widgets(self):
        # Chọn thư mục lưu
        save_frame = ttk.LabelFrame(self.root, text="Thư Mục Gốc Lưu Truyện", padding=(10, 10))
        save_frame.pack(fill="x", pady=(0, 10))

        ttk.Entry(save_frame, textvariable=self.save_dir_var, width=60).grid(row=0, column=0, padx=(0, 5), pady=5, sticky="ew")
        ttk.Button(save_frame, text="📁 Chọn Thư Mục", command=self.select_directory).grid(row=0, column=1, pady=5)
        save_frame.columnconfigure(0, weight=1)

        # Nhập thông tin cào
        scrape_frame = ttk.LabelFrame(self.root, text="Thông Tin Cào Truyện", padding=(10, 10))
        scrape_frame.pack(fill="x", pady=(0, 10))

        ttk.Label(scrape_frame, text="URL / Base URL:").grid(row=0, column=0, sticky="w", pady=5)
        ttk.Entry(scrape_frame, textvariable=self.base_url_var, width=60).grid(row=0, column=1, pady=5, columnspan=3, sticky="ew")

        ttk.Label(scrape_frame, text="Chương Bắt Đầu:").grid(row=1, column=0, sticky="w", pady=5)
        ttk.Entry(scrape_frame, textvariable=self.start_idx_var, width=15).grid(row=1, column=1, pady=5, sticky="w")

        ttk.Label(scrape_frame, text="Chương Kết Thúc:").grid(row=1, column=2, sticky="w", pady=5, padx=(10, 0))
        ttk.Entry(scrape_frame, textvariable=self.end_idx_var, width=15).grid(row=1, column=3, pady=5, sticky="w")
        scrape_frame.columnconfigure(1, weight=1)

        # Nút bấm điều khiển
        button_frame = ttk.Frame(self.root)
        button_frame.pack(pady=10)

        self.start_btn = ttk.Button(button_frame, text="🚀 BẮT ĐẦU TẢI", command=self.start_process)
        self.start_btn.pack(side="left", padx=5)

        self.pause_btn = ttk.Button(button_frame, text="⏸️ TẠM DỪNG", state="disabled", command=self.toggle_pause)
        self.pause_btn.pack(side="left", padx=5)

        self.stop_btn = ttk.Button(button_frame, text="🛑 DỪNG HẲN", state="disabled", command=self.stop_process)
        self.stop_btn.pack(side="left", padx=5)

        self.clear_btn = ttk.Button(button_frame, text="🧹 XÓA LOG", command=self.clear_log)
        self.clear_btn.pack(side="left", padx=5)

        # Bảng Log
        ttk.Label(self.root, text="Tiến trình tải:").pack(anchor="w")
        self.log_text = scrolledtext.ScrolledText(self.root, height=18, state='disabled', bg="#1e1e1e", fg="#00ff66", font=("Consolas", 10))
        self.log_text.pack(fill="both", expand=True, pady=(5, 0))

    def select_directory(self):
        folder = filedialog.askdirectory(initialdir=self.save_dir_var.get(), title="Chọn thư mục lưu truyện")
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

    def toggle_pause(self):
        if not self.is_paused:
            self.is_paused = True
            self.pause_btn.config(text="▶️ TIẾP TỤC")
            self.write_log("⏸️ [ĐÃ TẠM DỪNG] Đang tạm dừng tiến trình...")
        else:
            self.is_paused = False
            self.pause_btn.config(text="⏸️ TẠM DỪNG")
            self.write_log("▶️ [TIẾP TỤC] Đang tiếp tục...")

    def stop_process(self):
        self.is_stopped = True
        self.is_paused = False
        self.write_log("🛑 Đang gửi tín hiệu dừng...")

    def get_file_extension(self, url):
        clean_url = url.split('?')[0]
        ext = os.path.splitext(clean_url)[1].lower()
        if ext in ('.jpg', '.jpeg', '.png', '.webp', '.gif'):
            return ext
        return '.jpg'

    def start_process(self):
        url_input = self.base_url_var.get().strip()
        if not url_input:
            messagebox.showerror("Lỗi", "Vui lòng nhập URL hợp lệ!")
            return

        save_dir = self.save_dir_var.get().strip()
        if not os.path.isdir(save_dir):
            messagebox.showerror("Lỗi", "Thư mục lưu trữ không tồn tại!")
            return

        # Kiểm tra xem link có phải là Oneshot không
        is_oneshot = "oneshot" in url_input.lower()
        start_idx, end_idx = 1, 1

        # Nếu KHÔNG phải Oneshot thì mới bắt buộc kiểm tra số chương bắt đầu & kết thúc
        if not is_oneshot:
            try:
                start_idx = int(self.start_idx_var.get().strip())
                end_idx = int(self.end_idx_var.get().strip())
                if start_idx > end_idx:
                    messagebox.showerror("Lỗi", "Chương bắt đầu phải nhỏ hơn hoặc bằng chương kết thúc!")
                    return
            except ValueError:
                messagebox.showerror("Lỗi", "Chương bắt đầu và kết thúc phải là số nguyên!")
                return

        self.is_paused = False
        self.is_stopped = False

        self.start_btn.config(state='disabled')
        self.pause_btn.config(state='normal', text="⏸️ TẠM DỪNG")
        self.stop_btn.config(state='normal')

        thread = threading.Thread(
            target=self.run_download_loop, 
            args=(start_idx, end_idx, url_input, save_dir, is_oneshot)
        )
        thread.daemon = True
        thread.start()

    def download_chapter_images(self, downloader, chapter_url, chapter_folder, label_text):
        """Hàm hỗ trợ tải danh sách ảnh của 1 chương cụ thể"""
        os.makedirs(chapter_folder, exist_ok=True)
        self.write_log(f"\n👉 [{label_text}] Đang lấy danh sách ảnh: {chapter_url}")
        img_urls = downloader.get_images(chapter_url)

        if not img_urls:
            self.write_log(f"   [!] Không tìm thấy ảnh nào.")
            return False

        total_imgs = len(img_urls)
        self.write_log(f"   [+] Tìm thấy {total_imgs} ảnh. Đang tải vào '{os.path.basename(chapter_folder)}'...")

        saved_count = 0
        for idx, img_url in enumerate(img_urls, start=1):
            if self.is_stopped:
                break
            while self.is_paused:
                if self.is_stopped:
                    break
                time.sleep(0.5)

            ext = self.get_file_extension(img_url)
            filename = f"{idx:03d}{ext}"
            save_path = os.path.join(chapter_folder, filename)

            if downloader.download_and_save_image(img_url, save_path):
                saved_count += 1

        if self.is_stopped:
            return False

        if saved_count > 0:
            self.write_log(f"   ✅ Đã tải xong {saved_count}/{total_imgs} ảnh.")
            return True
        else:
            self.write_log(f"   ❌ Tải thất bại toàn bộ ảnh.")
            return False

    def run_download_loop(self, start_idx, end_idx, base_url, save_dir, is_oneshot):
        self.write_log("=== BẮT ĐẦU TẢI ẢNH GỐC ===")
        self.write_log(f"📁 Thư mục lưu: {save_dir}")

        downloader = None
        success_chap = 0
        fail_chap = 0

        try:
            downloader = DamCoNuongDownloader(log_callback=self.write_log)

            # TRƯỜNG HỢP 1: ONESHOT (Chỉ tải 1 link đơn lẻ duy nhất)
            if is_oneshot:
                self.write_log(f"📌 Chế độ: Tải Oneshot (bỏ qua số thứ tự chương)")
                
                # Tự động lấy tên thư mục từ link (Ví dụ: good-wife - oneshot)
                clean_url = base_url.rstrip('/')
                parts = [p for p in clean_url.split('/') if p]
                if len(parts) >= 2 and parts[-2] != 'truyen':
                    folder_name = f"{parts[-2]} - {parts[-1]}"
                else:
                    folder_name = parts[-1] if parts else "Oneshot"

                chapter_folder = os.path.join(save_dir, folder_name)
                success = self.download_chapter_images(downloader, base_url, chapter_folder, "Oneshot")
                if success:
                    success_chap += 1
                else:
                    fail_chap += 1

            # TRƯỜNG HỢP 2: DANH SÁCH CHƯƠNG THƯỜNG (chapter-1, chapter-2, ...)
            else:
                # Chuẩn hóa link Base URL dạng chapter-
                base_url = re.sub(r'(\d+)/?$', '', base_url.strip())
                if not base_url.endswith('-') and not base_url.endswith('/'):
                    base_url += '-'

                self.write_log(f"📖 Chế độ: Tải danh sách từ chương {start_idx} đến chương {end_idx}")

                for i in range(start_idx, end_idx + 1):
                    if self.is_stopped:
                        break

                    while self.is_paused:
                        if self.is_stopped:
                            break
                        time.sleep(0.5)

                    chapter_url = f"{base_url}{i}"
                    chapter_folder = os.path.join(save_dir, f"Chapter {i}")

                    success = self.download_chapter_images(downloader, chapter_url, chapter_folder, f"Chương {i}")
                    if success:
                        success_chap += 1
                    else:
                        fail_chap += 1

                    time.sleep(0.5)

        except Exception as e:
            self.write_log(f"❌ Lỗi ngoài ý muốn: {e}")
        finally:
            if downloader:
                downloader.close()

        self.write_log("\n=== HOÀN TẤT ===")
        self.write_log(f"🏆 Thành công: {success_chap} | Thất bại: {fail_chap}")
        self.root.after(0, self.reset_ui_state)

        if not self.is_stopped:
            messagebox.showinfo("Xong", f"Tải hoàn tất!\nThành công: {success_chap}\nThất bại: {fail_chap}")
        else:
            messagebox.showwarning("Đã dừng", "Tiến trình tải đã dừng lại!")

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