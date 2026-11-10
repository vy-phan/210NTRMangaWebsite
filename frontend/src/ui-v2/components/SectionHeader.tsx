import React from 'react';
import { Link } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  linkTo?: string;
  linkLabel?: string;
  count?: number;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, linkTo, linkLabel = 'Xem tất cả', count }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="font-display text-lg md:text-xl font-bold text-ink">
      {title}
      {count !== undefined && <span className="ml-2 text-sm font-normal text-ink-muted">{count}</span>}
    </h2>
    {linkTo && (
      <Link to={linkTo} className="text-[13px] font-semibold text-accent hover:underline shrink-0">
        {linkLabel} →
      </Link>
    )}
  </div>
);

export default SectionHeader;
