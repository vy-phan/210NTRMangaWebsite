// utils/imageUrl.ts
export const getOptimizedSrc = (src: string): string => {
  const isMobile = window.innerWidth < 768;
  const width = isMobile ? 800 : 1200;

  // ImageKit - nguồn chính hiện tại
  if (src.includes('imagekit.io')) {
    return `${src}${src.includes('?') ? '&' : '?'}tr=w-${width},q-80`;
  }

  // GitHub raw (legacy, ảnh webp ghép siêu dài) -> resize qua wsrv.nl
  if (src.includes('raw.githubusercontent.com')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&q=80&output=webp`;
  }

  // Nguồn ngoài khác giữ nguyên
  return src;
};