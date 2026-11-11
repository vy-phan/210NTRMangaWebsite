import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiClock, FiBookmark, FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useUiStore, type ThemePref } from '../lib/uiStore';
import { useAuthStore } from '../lib/auth';
import UserAvatar from '../components/UserAvatar';
import { getAllMangasAPI } from '../../api/mangaApi';
import FallbackImg from '../components/FallbackImg';

// Cache danh sách manga 5 phút để gợi ý tìm kiếm không gọi API liên tục
let mangaCache: { at: number; data: Promise<Manga[]> } | null = null;
const loadMangas = () => {
  if (!mangaCache || Date.now() - mangaCache.at > 5 * 60_000) {
    mangaCache = { at: Date.now(), data: getAllMangasAPI().catch(() => [] as Manga[]) };
  }
  return mangaCache.data;
};

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
  const user = useAuthStore((s) => s.user);
  const fetchUser = useAuthStore((s) => s.fetch);
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<Manga[]>([]);
  const [dropOpen, setDropOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tải thông tin user 1 lần khi mount (cookie session)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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

  // Gợi ý tìm kiếm realtime (debounce 250ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const v = q.trim();
    if (v.length < 2) {
      setSuggestions([]);
      setDropOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const list = await loadMangas();
      const needle = v.toLowerCase();
      const hits = list
        .filter((m) =>
          `${m.title} ${m.description || ''} ${m.author || ''}`.toLowerCase().includes(needle)
        )
        .slice(0, 6);
      setSuggestions(hits);
      setDropOpen(true);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const isActive = (href: string) =>
    href === '/ntr' ? location.pathname === '/ntr' || location.pathname === '/ntr/' : location.pathname.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    setDropOpen(false);
    if (v) navigate(`/ntr/search?q=${encodeURIComponent(v)}`);
  };

  const goManga = (slug: string) => {
    setDropOpen(false);
    setQ('');
    navigate(`/ntr/manga/${slug}`);
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

          {/* Desktop search + gợi ý */}
          <div ref={searchBoxRef} className="hidden md:block relative w-56 lg:w-72">
            <form onSubmit={submitSearch} className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => suggestions.length > 0 && setDropOpen(true)}
                onKeyDown={(e) => e.key === 'Escape' && setDropOpen(false)}
                placeholder="Tìm truyện… (Ctrl K)"
                className="input !pl-9 !py-2 !min-h-0 text-[13px]"
                role="combobox"
                aria-expanded={dropOpen}
                aria-label="Tìm kiếm truyện"
              />
            </form>

            {dropOpen && (
              <div
                className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-pop)' }}
              >
                {suggestions.length === 0 ? (
                  <p className="px-4 py-3 text-[13px] text-ink-muted">Đang tìm…</p>
                ) : (
                  <>
                    {suggestions.map((m) => (
                      <button
                        key={m._id}
                        onClick={() => goManga(m.slug)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-surface-2 text-left transition-colors"
                      >
                        <span className="w-9 shrink-0 aspect-[2/3] rounded-md overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                          <FallbackImg src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-medium text-ink truncate">{m.title}</span>
                          <span className="block text-[11px] text-ink-muted truncate">{m.author || m.status || ''}</span>
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={() => { setDropOpen(false); navigate(`/ntr/search?q=${encodeURIComponent(q.trim())}`); }}
                      className="w-full px-4 py-2.5 text-[13px] font-semibold text-accent hover:bg-accent-soft border-t border-line transition-colors"
                    >
                      Xem tất cả kết quả
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

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
              className="block rounded-full transition-transform hover:scale-105"
              aria-label={user ? `Tài khoản: ${user.displayName}` : 'Tài khoản'}
            >
              <UserAvatar user={user} size={30} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
