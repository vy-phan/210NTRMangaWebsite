const STORAGE_KEY = 'chapter-image-dimensions';
const MAX_ENTRIES = 500; // giới hạn tránh phình sessionStorage

let cache: Map<string, number> | null = null;

const loadCache = (): Map<string, number> => {
  if (cache) return cache;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    cache = raw ? new Map(JSON.parse(raw)) : new Map();
  } catch {
    cache = new Map();
  }
  return cache;
};

const persist = () => {
  if (!cache) return;
  try {
    // Giữ tối đa MAX_ENTRIES phần tử gần nhất
    const entries = Array.from(cache.entries()).slice(-MAX_ENTRIES);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // sessionStorage đầy hoặc bị chặn -> bỏ qua, không crash app
  }
};

export const getCachedAspectRatio = (src: string): number | undefined => {
  return loadCache().get(src);
};

export const setCachedAspectRatio = (src: string, ratio: number) => {
  loadCache().set(src, ratio);
  persist();
};