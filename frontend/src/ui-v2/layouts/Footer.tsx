import React from 'react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Trang chủ', href: '/ntr' },
  { label: 'Mới cập nhật', href: '/ntr/updates' },
  { label: 'Truyện mới', href: '/ntr/new' },
  { label: 'Thể loại', href: '/ntr/genre' },
  { label: 'Thư viện', href: '/ntr/library' },
  { label: 'Lịch sử đọc', href: '/ntr/history' },
  { label: 'Cài đặt', href: '/ntr/settings' },
];

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="space-y-3 max-w-xs">
            <Link to="/ntr" className="font-display text-lg font-bold">
              <span className="text-ink">Manga</span>
              <span className="text-accent">NTR</span>
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed">
              Nền tảng đọc manga & hentai. Nội dung chỉ dành cho người lớn 18+.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted mb-3">Điều hướng</p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-ink-muted hover:text-ink transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">© {year} MangaNTR</p>
          <Link to="/" className="text-xs font-semibold text-accent hover:underline">
            ← Quay lại giao diện cũ
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-ink-muted text-center">
          Nội dung trên trang web chỉ dành cho người từ 18 tuổi trở lên.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
