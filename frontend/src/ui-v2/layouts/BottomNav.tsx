import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiBookmark, FiClock, FiSettings } from 'react-icons/fi';

const tabs = [
  { label: 'Trang chủ', href: '/ntr', icon: <FiHome size={21} /> },
  { label: 'Tìm kiếm', href: '/ntr/search', icon: <FiSearch size={21} /> },
  { label: 'Thư viện', href: '/ntr/library', icon: <FiBookmark size={21} /> },
  { label: 'Lịch sử', href: '/ntr/history', icon: <FiClock size={21} /> },
  { label: 'Cài đặt', href: '/ntr/settings', icon: <FiSettings size={21} /> },
];

const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (href: string) =>
    href === '/ntr' ? location.pathname === '/ntr' || location.pathname === '/ntr/' : location.pathname.startsWith(href);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-line pb-safe"
      style={{ paddingBottom: 'calc(4px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-stretch justify-around px-1">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              to={tab.href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[52px] py-1.5"
            >
              <span style={{ color: active ? 'var(--accent)' : 'var(--ink-muted)' }}>{tab.icon}</span>
              <span
                className="text-[10px] leading-none"
                style={{ color: active ? 'var(--accent)' : 'var(--ink-muted)', fontWeight: active ? 700 : 500 }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
