import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemePref = 'light' | 'dark' | 'system';

interface UiState {
  theme: ThemePref;
  readerWidth: number; // 480 - 1200, mặc định 860

  setTheme: (t: ThemePref) => void;
  setReaderWidth: (w: number) => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const resolveTheme = (pref: ThemePref): 'light' | 'dark' => {
  if (pref !== 'system') return pref;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const applyTheme = (pref: ThemePref) => {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(pref);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      readerWidth: 860,

      setTheme: (theme) => set({ theme }),
      setReaderWidth: (w) => set({ readerWidth: clamp(Math.round(w), 480, 1200) }),
    }),
    {
      name: 'ntr-ui-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        readerWidth: s.readerWidth,
      }),
    }
  )
);

// Áp dụng theme ngay khi module load (trước khi trang vẽ) + theo dõi thay đổi
if (typeof window !== 'undefined') {
  applyTheme(useUiStore.getState().theme);

  useUiStore.subscribe((state, prev) => {
    if (state.theme !== prev.theme) applyTheme(state.theme);
  });

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (useUiStore.getState().theme === 'system') applyTheme('system');
    };
    mq.addEventListener?.('change', onChange);
  }
}
