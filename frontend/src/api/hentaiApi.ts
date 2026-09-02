const HENTAI_API_BASE = 'https://hentaiocean.com/api';

/**
 * Fetch hentai data by slug from Hentai Ocean API
 * @param slug - The slug of the hentai (e.g., 'imaria-1')
 * @returns Promise<Hentai>
 */
export const getHentaiBySlugAPI = async (slug: string): Promise<Hentai> => {
  const response = await fetch(`${HENTAI_API_BASE}?action=hentai&slug=${slug}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch hentai: ${response.statusText}`);
  }

  const data: HentaiData = await response.json();

  if (!data.info || data.info.length === 0) {
    throw new Error('No hentai data found');
  }

  const hentaiInfo = data.info[0];
  const genres = data.genres?.map(g => g.genre) || [];

  return {
    id: hentaiInfo.id,
    slug: hentaiInfo.urlname,
    title: hentaiInfo.videoname,
    description: hentaiInfo.description,
    releaseDate: hentaiInfo.releasedate,
    uploadDate: hentaiInfo.uploaddate,
    coverImage: `https://hentaiocean.com/assets/cover/${hentaiInfo.coverimg}`,
    series: hentaiInfo.series,
    status: hentaiInfo.status,
    recentRelease: hentaiInfo.recentrelease,
    genres,
  };
};

/**
 * Fetch multiple hentai data by slugs
 * @param slugs - Array of slugs to fetch
 * @returns Promise<Hentai[]>
 */
export const getMultipleHentaisAPI = async (slugs: string[]): Promise<Hentai[]> => {
  const promises = slugs.map(slug => getHentaiBySlugAPI(slug));
  return Promise.all(promises);
};

/**
 * Get the embed URL for a hentai
 * @param slug - The slug of the hentai
 * @param logo - Optional custom logo URL
 * @param lessAds - Whether to use less ads mode
 * @returns The embed URL
 */
export const getHentaiEmbedUrl = (
  slug: string,
  logo?: string,
  lessAds: boolean = false
): string => {
  const baseUrl = `https://hentaiocean.com/embed/${slug}`;
  const params = new URLSearchParams();
  
  if (logo) {
    params.append('logo', logo);
  }
  
  if (lessAds) {
    params.append('la', '1');
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Get the thumbnail URL for a hentai
 * @param slug - The slug of the hentai
 * @returns The thumbnail URL
 */
export const getHentaiThumbnailUrl = (slug: string): string => {
  return `https://hentaiocean.com/thumbnail/${slug}.webp`;
};

/**
 * Get the storyboard URL for a hentai
 * @param slug - The slug of the hentai
 * @returns The storyboard URL
 */
export const getHentaiStoryboardUrl = (slug: string): string => {
  return `https://hentaiocean.com/storyboard/${slug}.webp`;
};
