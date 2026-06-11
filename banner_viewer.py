import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import os
import re

class BannerViewerApp:
    def __init__(self, root, folder_path):
        self.root = root
        self.root.title("Banner Viewer & Renamer")
        self.folder_path = folder_path
        self.image_files = []
        self.thumbnails = []
        self.selected_index = None
        self.drag_start_index = None

        # Tải danh sách ảnh
        self.load_images()

        # Tạo giao diện
        self.create_ui()

    def natural_sort_key(self, s):
        # Hàm để sắp xếp tự nhiên (1, 2, ..., 10, 11 thay vì 1, 10, 11, 2)
        return [int(text) if text.isdigit() else text.lower() for text in re.split('(\d+)', s)]

    def load_images(self):
        # Lấy tất cả file ảnh trong thư mục
        supported_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.webp')
        files = []
        for filename in os.listdir(self.folder_path):
            if filename.lower().endswith(supported_extensions):
                files.append(filename)
        
        # Sắp xếp tự nhiên
        files.sort(key=self.natural_sort_key)
        self.image_files = [os.path.join(self.folder_path, f) for f in files]

    def create_ui(self):
        # Khung chính
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Tiêu đề
        title_label = ttk.Label(main_frame, text="Kéo thả để HOÁN ĐỔI TÊN FILE", font=('Arial', 14, 'bold'), foreground='#d32f2f')
        title_label.grid(row=0, column=0, columnspan=5, pady=(0, 10))

        # Khung chứa gallery
        self.canvas = tk.Canvas(main_frame, bg='#f0f0f0')
        scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = ttk.Frame(self.canvas)

        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )

        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)

        self.canvas.grid(row=1, column=0, columnspan=4, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=1, column=4, sticky=(tk.N, tk.S))

        # Cấu hình grid để co giãn
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(1, weight=1)
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)

        # Hiển thị ảnh
        self.display_images()

    def display_images(self):
        # Xóa các widget cũ
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        
        self.thumbnails = []

        # Hiển thị ảnh theo lưới 5 cột, thumbnail nhỏ hơn
        for idx, img_path in enumerate(self.image_files):
            try:
                # Mở ảnh và tạo thumbnail nhỏ hơn
                img = Image.open(img_path)
                img.thumbnail((100, 100))  # Nhỏ hơn
                photo = ImageTk.PhotoImage(img)
                self.thumbnails.append(photo)

                # Tạo frame cho mỗi ảnh
                frame = tk.Frame(self.scrollable_frame, bg='white', padx=3, pady=3, 
                                 highlightthickness=1, highlightbackground='#ccc')
                frame.grid(row=idx // 5, column=idx % 5, padx=4, pady=4)
                
                # Label số thứ tự
                tk.Label(frame, text=f"#{idx+1}", font=('Arial', 8, 'bold'), bg='white', fg='#555').pack()
                
                # Label hiển thị ảnh
                lbl = tk.Label(frame, image=photo, bg='white', cursor="hand2")
                lbl.image = photo
                lbl.pack()
                
                # Label tên file
                filename = os.path.basename(img_path)
                tk.Label(frame, text=filename[:12] + "..." if len(filename) > 12 else filename, 
                        font=('Arial', 7), bg='white').pack()

                # Gắn sự kiện kéo thả cho cả frame
                frame.bind("<Button-1>", lambda e, i=idx: self.on_drag_start(e, i))
                lbl.bind("<Button-1>", lambda e, i=idx: self.on_drag_start(e, i))

            except Exception as e:
                print(f"Lỗi khi tải {img_path}: {e}")

    def on_drag_start(self, event, index):
        self.drag_start_index = index
        # Tạo cửa sổ popup để chọn vị trí đích
        self.show_swap_dialog(index)

    def show_swap_dialog(self, source_idx):
        dialog = tk.Toplevel(self.root)
        dialog.title("Hoán đổi với...")
        dialog.geometry("300x400")
        dialog.transient(self.root)
        dialog.grab_set()

        ttk.Label(dialog, text=f"Chọn file để hoán đổi với:\n{os.path.basename(self.image_files[source_idx])}", 
                 padding=10).pack()

        # Listbox chọn file đích
        listbox = tk.Listbox(dialog)
        listbox.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        for idx, img_path in enumerate(self.image_files):
            listbox.insert(tk.END, f"{idx+1}. {os.path.basename(img_path)}")

        def on_swap():
            selection = listbox.curselection()
            if selection:
                target_idx = selection[0]
                if target_idx != source_idx:
                    self.swap_files(source_idx, target_idx)
                dialog.destroy()

        ttk.Button(dialog, text="Hoán đổi", command=on_swap).pack(pady=10)

    def swap_files(self, idx1, idx2):
        # Hoán đổi tên file thực tế
        file1 = self.image_files[idx1]
        file2 = self.image_files[idx2]

        # Đổi tên thông qua file tạm để tránh lỗi
        ext1 = os.path.splitext(file1)[1]
        temp_file = os.path.join(self.folder_path, f"temp_swap_{idx1}{ext1}")

        try:
            os.rename(file1, temp_file)
            os.rename(file2, file1)
            os.rename(temp_file, file2)
            
            # Cập nhật danh sách và làm mới giao diện
            self.image_files[idx1], self.image_files[idx2] = self.image_files[idx2], self.image_files[idx1]
            self.display_images()
            messagebox.showinfo("Thành công", f"Đã hoán đổi:\n{os.path.basename(file1)}\n↔️\n{os.path.basename(file2)}")
        except Exception as e:
            messagebox.showerror("Lỗi", f"Không thể đổi tên file: {e}")

if __name__ == "__main__":
    # Thư mục chứa ảnh banner
    BANNER_FOLDER = r"d:\MangaHentaiWeb\frontend\public\avatar"
    
    root = tk.Tk()
    app = BannerViewerApp(root, BANNER_FOLDER)
    root.geometry("900x700")
    root.mainloop()
