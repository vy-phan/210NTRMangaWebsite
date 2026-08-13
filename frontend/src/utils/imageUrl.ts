export const getOptimizedSrc = (src: string) => {
  if (src.includes('imagekit.io')) {
    const isMobile = window.innerWidth < 768;
    return `${src}${src.includes('?') ? '&' : '?'}tr=w-${isMobile ? 800 : 1200},q-80`;
  }
  return src;
};