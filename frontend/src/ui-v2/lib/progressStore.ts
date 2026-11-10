import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PagePos {
  page: number; // index trang đang đọc (0-based)
  total: number;
  at: number;
}

interface MangaProgress {
  read: number[]; // danh sách số chương đã đọc
  pos: Record<string, PagePos>; // key = chapterNumber
}

interface ProgressState {
  data: Record<string, MangaProgress>;

  savePos: (mangaId: string, chapterNumber: number, page: number, total: number) => void;
  getPos: (mangaId: string, chapterNumber: number) => PagePos | undefined;
  markRead: (mangaId: string, chapterNumber: number) => void;
  isRead: (mangaId: string, chapterNumber: number) => boolean;
  getReadChapters: (mangaId: string) => number[];
  removeManga: (mangaId: string) => void;
  clearAll: () => void;
}

const MAX_POS_PER_MANGA = 200;
const MAX_MANGAS = 300;

const trimPos = (pos: Record<string, PagePos>): Record<string, PagePos> => {
  const keys = Object.keys(pos);
  if (keys.length <= MAX_POS_PER_MANGA) return pos;
  const sorted = keys
    .map((k) => [k, pos[k].at] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_POS_PER_MANGA);
  const keep = new Set(sorted.map(([k]) => k));
  const out: Record<string, PagePos> = {};
  keys.forEach((k) => {
    if (keep.has(k)) out[k] = pos[k];
  });
  return out;
};

const trimMangas = (data: Record<string, MangaProgress>): Record<string, MangaProgress> => {
  const keys = Object.keys(data);
  if (keys.length <= MAX_MANGAS) return data;
  // Ưu tiên giữ truyện có pos mới nhất
  const scored = keys.map((k) => {
    const p = data[k];
    const latest = Math.max(
      0,
      ...Object.values(p.pos).map((v) => v.at),
      p.read.length ? 1 : 0
    );
    return [k, latest] as const;
  });
  scored.sort((a, b) => b[1] - a[1]);
  const keep = new Set(scored.slice(0, MAX_MANGAS).map(([k]) => k));
  const out: Record<string, MangaProgress> = {};
  keys.forEach((k) => {
    if (keep.has(k)) out[k] = data[k];
  });
  return out;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      data: {},

      savePos: (mangaId, chapterNumber, page, total) => {
        const cur = get().data[mangaId] || { read: [], pos: {} };
        const safePage = Math.max(0, Math.min(page, Math.max(0, total - 1)));
        const next: MangaProgress = {
          read: cur.read,
          pos: {
            ...cur.pos,
            [String(chapterNumber)]: { page: safePage, total, at: Date.now() },
          },
        };
        set({ data: trimMangas({ ...get().data, [mangaId]: { ...next, pos: trimPos(next.pos) } }) });
      },

      getPos: (mangaId, chapterNumber) => get().data[mangaId]?.pos[String(chapterNumber)],

      markRead: (mangaId, chapterNumber) => {
        const cur = get().data[mangaId] || { read: [], pos: {} };
        if (cur.read.includes(chapterNumber)) return;
        set({
          data: {
            ...get().data,
            [mangaId]: { ...cur, read: [...cur.read, chapterNumber].slice(-500) },
          },
        });
      },

      isRead: (mangaId, chapterNumber) => !!get().data[mangaId]?.read.includes(chapterNumber),

      getReadChapters: (mangaId) => get().data[mangaId]?.read || [],

      removeManga: (mangaId) => {
        const next = { ...get().data };
        delete next[mangaId];
        set({ data: next });
      },

      clearAll: () => set({ data: {} }),
    }),
    {
      name: 'ntr-progress-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helpers đọc trực tiếp (không qua hook) cho component không cần reactive
export const getSavedPos = (mangaId: string, chapterNumber: number): PagePos | undefined =>
  useProgressStore.getState().getPos(mangaId, chapterNumber);

export const getReadSet = (mangaId: string): Set<number> =>
  new Set(useProgressStore.getState().getReadChapters(mangaId));
