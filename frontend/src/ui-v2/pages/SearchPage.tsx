import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllMangasAPI } from '../../api/mangaApi';
import { getAllGenresAPI } from '../../api/genreApi';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import MangaGrid from '../components/MangaGrid';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

type SortKey = 'update' | 'new' | 'az';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'update', label: 'Mới cập nhật' },
  { key: 'new', label: 'Mới đăng' },
  { key: 'az', label: 'Tên A-Z' },
];

const STATUS_OPTIONS = [
  { key: 'Ongoing', label: 'Đang tiến hành' },
  { key: 'Completed', label: 'Hoàn thành' },
  { key: 'Hiatus', label: 'Tạm ngưng' },
];

const parseCsv = (v: string | null): string[] => (v ? v.split(',').filter(Boolean) : []);
const toCsv = (arr: string[]) => arr.join(',');

const genreKeysOf = (m: Manga): Set<string> => {
  const set = new Set<string>();
  (m.genres || []).forEach((g) => {
    if (typeof g === 'string') {
      set.add(g.toLowerCase());
    } else if (g && g.name) {
      set.add(g.name.toLowerCase());
      if (g.slug) set.add(g.slug.toLowerCase());
    }
  });
  return set;
};

const genreKeyOf = (g: Genre): string => (g.slug || g.name).toLowerCase();

const applyFilters = (
  list: Manga[],
  opts: { sort: SortKey; status: string[]; inc: string[]; exc: string[] }
): Manga[] => {
  let out = list;
  if (opts.status.length) {
    const wanted = new Set(opts.status.map((s) => s.toLowerCase()));
    out = out.filter((m) => m.status && wanted.has(String(m.status).toLowerCase()));
  }
  if (opts.inc.length || opts.exc.length) {
    const inc = new Set(opts.inc.map((s) => s.toLowerCase()));
    const exc = new Set(opts.exc.map((s) => s.toLowerCase()));
    out = out.filter((m) => {
      const keys = genreKeysOf(m);
      const hasInc = inc.size === 0 || [...inc].some((k) => keys.has(k));
      const hasExc = [...exc].some((k) => keys.has(k));
      return hasInc && !hasExc;
    });
  }
  const time = (m: Manga) => {
    const t = m.latestChapters?.[0]?.createdAt || m.updatedAt || m.createdAt;
    return t ? new Date(t).getTime() : 0;
  };
  out = [...out];
  if (opts.sort === 'new') {
    out.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  } else if (opts.sort === 'az') {
    out.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
  } else {
    out.sort((a, b) => time(b) - time(a));
  }
  return out;
};

// Bộ lọc tìm kiếm: toàn bộ trạng thái nằm trên URL
const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const sort = (searchParams.get('sort') as SortKey) || 'update';
  const statusList = parseCsv(searchParams.get('status'));
  const incList = parseCsv(searchParams.get('inc'));
  const excList = parseCsv(searchParams.get('exc'));

  const [inputVal, setInputVal] = useState(query);
  const [allMangas, setAllMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Backend không có API search → tải toàn bộ 1 lần rồi lọc phía client (giống UI cũ)
  useEffect(() => {
    let alive = true;
    Promise.all([getAllMangasAPI(), getAllGenresAPI()])
      .then(([mangas, gs]) => {
        if (!alive) return;
        setAllMangas(mangas || []);
        setGenres(gs || []);
      })
      .catch(() => {
        if (alive) setAllMangas([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Đồng bộ input khi URL đổi (back/forward)
  useEffect(() => setInputVal(query), [query]);

  const updateParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next, { replace: false });
  };

  const setQ = (v: string) => updateParams({ q: v.trim() || null });

  const activeFilterCount =
    (sort !== 'update' ? 1 : 0) + statusList.length + incList.length + excList.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? allMangas.filter((m) => {
          const hay = `${m.title} ${m.description || ''} ${m.author || ''}`.toLowerCase();
          return hay.includes(q);
        })
      : allMangas;
    return applyFilters(base, { sort: sort as SortKey, status: statusList, inc: incList, exc: excList });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMangas, query, sort, statusList.join(','), incList.join(','), excList.join(',')]);

  const hasQuery = query.trim().length > 0;
  // idle = URL hoàn toàn trống (chưa chọn sort/filter, chưa có từ khóa)
  const idle = !hasQuery && activeFilterCount === 0 && !searchParams.get('sort');

  // Thể loại 3 trạng thái: chạm 1 = phải có, chạm 2 = loại trừ, chạm 3 = bỏ
  const cycleGenre = (key: string) => {
    const inInc = incList.includes(key);
    const inExc = excList.includes(key);
    let inc = [...incList];
    let exc = [...excList];
    if (!inInc && !inExc) inc.push(key);
    else if (inInc) { inc = inc.filter((k) => k !== key); exc.push(key); }
    else { exc = exc.filter((k) => k !== key); }
    updateParams({ inc: inc.length ? toCsv(inc) : null, exc: exc.length ? toCsv(exc) : null });
  };

  const toggleStatus = (key: string) => {
    const next = statusList.includes(key) ? statusList.filter((s) => s !== key) : [...statusList, key];
    updateParams({ status: next.length ? toCsv(next) : null });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    setSearchParams(next);
  };

  const genreState = (key: string): 'inc' | 'exc' | 'none' =>
    incList.includes(key) ? 'inc' : excList.includes(key) ? 'exc' : 'none';

  const FilterPanel: React.FC = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Sắp xếp</p>
        <div className="space-y-1">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => updateParams({ sort: o.key })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                sort === o.key ? 'bg-accent-soft text-accent font-semibold' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">Tình trạng</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => toggleStatus(o.key)}
              className={`chip !py-1.5 !px-3 !text-xs ${statusList.includes(o.key) ? 'chip-active' : ''}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {genres.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">Thể loại</p>
          <p className="text-[11px] text-ink-muted mb-2">Chạm: phải có → loại trừ → bỏ chọn</p>
          <div className="flex flex-wrap gap-1.5">
            {genres.map((g) => {
              const key = genreKeyOf(g);
              const st = genreState(key);
              return (
                <button
                  key={g._id}
                  onClick={() => cycleGenre(key)}
                  className={`chip !py-1.5 !px-3 !text-xs ${st === 'inc' ? 'chip-active' : st === 'exc' ? 'chip-excluded' : ''}`}
                >
                  <span className="chip-name">{g.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="btn-ghost w-full !text-danger">
          Xóa bộ lọc
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 md:py-8">
      {/* Ô tìm kiếm */}
      <form onSubmit={(e) => { e.preventDefault(); setQ(inputVal); }} className="relative max-w-xl mb-5">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); if (!e.target.value.trim()) setQ(''); }}
          placeholder="Tìm theo tên truyện…"
          className="input !pl-10 !pr-10"
        />
        {inputVal && (
          <button
            type="button"
            onClick={() => { setInputVal(''); setQ(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
            aria-label="Xóa tìm kiếm"
          >
            <FiX size={16} />
          </button>
        )}
      </form>

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        {/* Desktop: cột lọc cố định */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 surface p-4 max-h-[calc(100dvh-8rem)] overflow-y-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-4">Bộ lọc</p>
            <FilterPanel />
          </div>
        </aside>

        {/* Kết quả */}
        <div className="min-w-0">
          {/* Mobile: nút bộ lọc */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <p className="text-sm text-ink-muted">
              {!idle
                ? `${filtered.length} kết quả${query ? ` cho “${query}”` : ''}`
                : 'Nhập tên truyện hoặc chọn bộ lọc để tìm'}
            </p>
            <button onClick={() => setSheetOpen(true)} className="chip">
              <FiSliders size={14} /> Bộ lọc
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: 'var(--accent)', color: '#fff' }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {loading ? (
            <div className="manga-grid">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3]" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : idle ? (
            <EmptyState
              icon={<FiSearch size={26} />}
              title="Tìm truyện"
              description="Nhập tên manga, manhwa hoặc thể loại để bắt đầu. Kết quả sẽ hiện ngay khi bạn ngừng gõ."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Không có truyện nào khớp"
              description="Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm."
              actionLabel={activeFilterCount > 0 ? 'Xóa bộ lọc' : undefined}
              onAction={activeFilterCount > 0 ? clearFilters : undefined}
            />
          ) : (
            <>
              <p className="hidden lg:block text-sm text-ink-muted mb-4">
                {filtered.length} kết quả{query ? ` cho “${query}”` : ''}
              </p>
              <MangaGrid mangas={filtered} />
            </>
          )}
        </div>
      </div>

      {/* Bottom sheet bộ lọc (mobile) */}
      {sheetOpen && (
        <div className="lg:hidden">
          <div className="sheet-backdrop" onClick={() => setSheetOpen(false)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-[70] bg-surface rounded-t-3xl max-h-[75dvh] flex flex-col animate-slide-up"
            style={{ animation: 'ntr-sheet-up 250ms ease-out' }}
            role="dialog"
            aria-modal="true"
            aria-label="Bộ lọc tìm kiếm"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-line">
              <p className="font-display font-bold text-ink">Bộ lọc</p>
              <button onClick={() => setSheetOpen(false)} className="p-2 text-ink-muted" aria-label="Đóng">
                <FiX size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 pb-8">
              <FilterPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
