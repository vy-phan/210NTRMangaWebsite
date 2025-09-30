import { useEffect } from 'react';

interface SeoTagsProps {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string; // ISO
  updatedTime?: string;   // ISO
  canonical?: string;
  locale?: string; // e.g., vi_VN
}

function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setProperty(property: string, content: string) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const SeoTags = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'article',
  publishedTime,
  updatedTime,
  canonical,
  locale = 'vi_VN',
}: SeoTagsProps) => {
  useEffect(() => {
    // Title
    if (title) document.title = title;

    // Basic metas
    if (description) setMeta('description', description);
    if (keywords && keywords.length > 0) setMeta('keywords', keywords.join(', '));

    // Open Graph
    setProperty('og:title', title);
    if (description) setProperty('og:description', description);
    setProperty('og:type', type);
    if (url) setProperty('og:url', url);
    if (image) setProperty('og:image', image);
    if (locale) setProperty('og:locale', locale);

    // Article specific
    if (type === 'article') {
      if (publishedTime) setProperty('article:published_time', publishedTime);
      if (updatedTime) setProperty('article:modified_time', updatedTime);
    }

    // Twitter
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', title);
    if (description) setMeta('twitter:description', description);
    if (image) setMeta('twitter:image', image);

    // Canonical
    if (canonical) setLink('canonical', canonical);
  }, [title, description, keywords, image, url, type, publishedTime, updatedTime, canonical, locale]);

  return null;
};

export default SeoTags;
