import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllGenresAPI } from '../../api/genreApi';
import { FiSearch } from 'react-icons/fi';
import SectionHeader from '../components/SectionHeader';
import Skeleton from '../components/Skeleton';

const GenrePage: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAllGenresAPI()
      .then(setGenres)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(
    () =>
      genres
        .filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => (b.count || 0) - (a.count || 0)),
    [genres, search]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <SectionHeader title="Thể loại" count={loading ? undefined : genres.length} />

      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Lọc thể loại…"
          className="input !pl-10"
        />
      </div>

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {[...Array(16)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-ink-muted py-10 text-center">
          Không tìm thấy thể loại nào khớp với “{search}”.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sorted.map((g) => (
            <Link key={g._id} to={`/ntr/genre/${g.slug}`} className="chip">
              <span className="chip-name">{g.name}</span>
              {g.count !== undefined && <span className="text-[11px] opacity-60">{g.count}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenrePage;
