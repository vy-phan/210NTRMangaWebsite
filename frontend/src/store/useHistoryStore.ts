import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


interface HistoryState {
    history: HistoryItem[];
    
    // Actions
    addToHistory: (manga: any, chapter: any) => void;
    removeFromHistory: (mangaId: string) => void;
    clearHistory: () => void;
    updateHistoryChapter: (mangaId: string, chapter: any) => void;
}

export const useHistoryStore = create<HistoryState>()(
    persist(
        (set, get) => ({
            history: [],

            /**
             * HÀM THÔNG MINH: Thêm vào lịch sử
             * - Tự động xóa trùng lặp (truyện cũ đọc lại sẽ nhảy lên đầu)
             * - Cập nhật chapter mới nhất của truyện đó
             * - Giới hạn 50 item
             */
            addToHistory: (manga, chapter) => {
                const currentHistory = get().history;
                
                // Tạo object item mới (Flatten data để dễ lưu)
                const newItem: HistoryItem = {
                    mangaId: manga._id,
                    mangaTitle: manga.title,
                    mangaSlug: manga.slug,
                    mangaPoster: manga.poster || '',
                    
                    chapterId: chapter._id,
                    chapterNumber: chapter.number,
                    chapterTitle: chapter.title || chapter.number.toString(),
                    
                    readAt: Date.now(),
                };

                // 1. Lọc bỏ truyện này nếu đã có trong danh sách cũ (để đưa nó lên đầu)
                const filteredHistory = currentHistory.filter(item => item.mangaId !== manga._id);

                // 2. Thêm item mới vào đầu mảng
                const newHistory = [newItem, ...filteredHistory];

                // 3. Cắt bớt nếu quá dài (Giữ lại 50 truyện gần nhất)
                if (newHistory.length > 50) {
                    newHistory.length = 50; 
                }

                set({ history: newHistory });
            },

            /**
             * Xóa 1 truyện khỏi lịch sử
             */
            removeFromHistory: (mangaId) => {
                set((state) => ({
                    history: state.history.filter((item) => item.mangaId !== mangaId),
                }));
            },

            /**
             * Xóa sạch lịch sử
             */
            clearHistory: () => {
                set({ history: [] });
            },

            updateHistoryChapter: (mangaId, chapter) => {
                const currentHistory = get().history;
                const existingItem = currentHistory.find(item => item.mangaId === mangaId);

                // Chỉ thực hiện nếu truyện này ĐÃ CÓ trong lịch sử
                if (existingItem) {
                    const updatedItem = {
                        ...existingItem, // Giữ nguyên Poster, MangaTitle, Slug cũ
                        chapterId: chapter._id,
                        chapterNumber: chapter.number, // Hoặc chapter.number + 1 tùy logic của bạn
                        chapterTitle: chapter.title || chapter.number.toString(),
                        readAt: Date.now(),
                    };

                    // Đưa lên đầu danh sách
                    const otherItems = currentHistory.filter(item => item.mangaId !== mangaId);
                    set({ history: [updatedItem, ...otherItems] });
                }
            },
        }),
        {
            name: 'manga-history-storage',
            storage: createJSONStorage(() => localStorage), // Chỉ định dùng LocalStorage
        }
    )
);