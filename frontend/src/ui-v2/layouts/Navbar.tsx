import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiBookmark, FiUser, FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useUiStore, type ThemePref } from '../lib/uiStore';

const navLinks = [
  { label: 'Trang chủ', href: '/ntr' },
  { label: 'Mới cập nhật', href: '/ntr/updates' },
  { label: 'Truyện mới', href: '/ntr/new' },
  { label: 'Thể loại', href: '/ntr/genre' },
];

const themeMeta: Record<ThemePref, { icon: React.ReactNode; label: string }> = {
  light: { icon: <FiSun size={17} />, label: 'Sáng' },
  dark: { icon: <FiMoon size={17} />, label: 'Tối' },
  system: { icon: <FiMonitor size={17} />, label: 'Theo hệ thống' },
};

const THEME_ORDER: ThemePref[] = ['light', 'dark', 'system'];

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ctrl+K / Cmd+K focus ô tìm kiếm
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href: string) =>
    href === '/ntr' ? location.pathname === '/ntr' || location.pathname === '/ntr/' : location.pathname.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (v) navigate(`/ntr/search?q=${encodeURIComponent(v)}`);
  };

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
  };

  const t = themeMeta[theme];

  return (
    <header className={`sticky top-0 z-50 transition-shadow ${scrolled ? 'shadow-sm' : ''}`} style={{ boxShadow: scrolled ? '0 1px 0 var(--line)' : 'none' }}>
      <div className="glass-header">
        <div className="max-w-6xl mx-auto px-4 h-14 md:h-16 flex items-center gap-3">
          {/* Logo */}
          <Link to="/ntr" className="font-display text-lg font-bold tracking-tight shrink-0 select-none">
            <span className="text-ink">Manga</span>
            <span className="text-accent">NTR</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(l.href) ? 'text-accent bg-accent-soft' : 'text-ink-muted hover:text-ink hover:bg-surface-2'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Desktop search */}
          <form onSubmit={submitSearch} className="hidden md:block relative w-56 lg:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm truyện… (Ctrl K)"
              className="input !pl-9 !py-2 !min-h-0 text-[13px]"
            />
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Link
              to="/ntr/search"
              className="md:hidden p-2.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="Tìm kiếm"
            >
              <FiSearch size={19} />
            </Link>
            <Link
              to="/ntr/library"
              className="hidden sm:flex p-2.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="Thư viện"
            >
              <FiBookmark size={18} />
            </Link>
            <Link
              to="/ntr/history"
              className="hidden sm:flex p-2.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="Lịch sử đọc"
            >
              <FiClock size={18} />
            </Link>
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label={`Giao diện: ${t.label}`}
              title={`Giao diện: ${t.label}`}
            >
              {t.icon}
            </button>
            <Link
              to="/ntr/profile"
              className="p-2.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="Tài khoản"
            >
              <FiUser size={18} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
