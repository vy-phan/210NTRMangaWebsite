import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type FollowStatus = 'reading' | 'plan' | 'done' | 'dropped';

export const FOLLOW_STATUS_LABEL: Record<FollowStatus, string> = {
  reading: 'Đang đọc',
  plan: 'Sẽ đọc',
  done: 'Đã đọc xong',
  dropped: 'Bỏ dở',
};

export interface FollowEntry {
  mangaId: string;
  title: string;
  slug: string;
  poster: string;
  status: FollowStatus;
  addedAt: number;
}

interface FollowState {
  follows: Record<string, FollowEntry>;

  toggleFollow: (manga: { _id: string; title: string; slug: string; poster?: string }) => FollowEntry | null;
  setStatus: (mangaId: string, status: FollowStatus) => void;
  removeFollow: (mangaId: string) => void;
  clearFollows: () => void;
}

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      follows: {},

      toggleFollow: (manga) => {
        const { follows } = get();
        if (follows[manga._id]) {
          const next = { ...follows };
          delete next[manga._id];
          set({ follows: next });
          return null;
        }
        const entry: FollowEntry = {
          mangaId: manga._id,
          title: manga.title,
          slug: manga.slug,
          poster: manga.poster || '',
          status: 'reading',
          addedAt: Date.now(),
        };
        set({ follows: { ...follows, [manga._id]: entry } });
        return entry;
      },

      setStatus: (mangaId, status) => {
        const entry = get().follows[mangaId];
        if (!entry) return;
        set({ follows: { ...get().follows, [mangaId]: { ...entry, status } } });
      },

      removeFollow: (mangaId) => {
        const next = { ...get().follows };
        delete next[mangaId];
        set({ follows: next });
      },

      clearFollows: () => set({ follows: {} }),
    }),
    {
      name: 'ntr-follows-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const getFollow = (mangaId: string): FollowEntry | undefined =>
  useFollowStore.getState().follows[mangaId];
