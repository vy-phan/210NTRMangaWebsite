import React from 'react';
import MangaCard from './MangaCard';

interface MangaGridProps {
  mangas: Manga[];
  /** 'sm' = lưới gọn cho sidebar/khu vực hẹp */
  size?: 'md' | 'sm';
  /** mangaId -> tiến độ đọc 0..1 */
  progressMap?: Record<string, number>;
}

const MangaGrid: React.FC<MangaGridProps> = ({ mangas, size = 'md', progressMap }) => (
  <div className={size === 'sm' ? 'manga-grid-sm' : 'manga-grid'}>
    {mangas.map((manga) => (
      <MangaCard key={manga._id} manga={manga} progress={progressMap?.[manga._id]} />
    ))}
  </div>
);

export default MangaGrid;
