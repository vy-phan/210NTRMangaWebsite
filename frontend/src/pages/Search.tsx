import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import { getAllMangasAPI } from '../api/mangaApi';
import { getAllGenresAPI } from '../api/genreApi';
import MangaGrid from '../components/manga/MangaGrid'; // Tái sử dụng lưới truyện

const Search = () => {
  // State để lưu danh sách manga gốc từ API
  const [allMangas, setAllMangas] = useState<Manga[]>([]);
  // Danh sách thể loại
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  // State để lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  // Lọc theo nhiều thể loại (slug)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  // Sắp xếp
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | ''>('');
  // State quản lý loading
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch toàn bộ manga một lần duy nhất khi component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [mangas, genres] = await Promise.all([
          getAllMangasAPI(),
          getAllGenresAPI(),
        ]);
        setAllMangas(mangas);
        setAllGenres(genres);
      } catch (error) {
        toast.error("Không thể tải dữ liệu tìm kiếm.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

  // 2. Lọc danh sách manga dựa trên `searchTerm`
  //    Sử dụng useMemo để tối ưu, chỉ tính toán lại khi cần
  const filteredMangas = useMemo(() => {
    let list = allMangas;

    // Tìm theo tiêu đề
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q));
    }

    // Lọc theo thể loại (match ALL selected - AND)
    if (selectedGenres.length > 0) {
      list = list.filter(m => {
        const gs = (m.genres || []).map(g => typeof g === 'string' ? g : g.slug);
        return selectedGenres.every(sg => gs.includes(sg));
      });
    }

    // Sắp xếp
    if (sortOrder) {
      list = [...list].sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === 'newest' ? (tb - ta) : (ta - tb);
      });
    }

    // Nếu không có query, giữ behavior cũ: hiển thị 12 truyện đầu
    if (!searchTerm.trim() && selectedGenres.length === 0 && !sortOrder) {
      return list.slice(0, 12);
    }
    return list;
  }, [allMangas, searchTerm, selectedGenres, sortOrder]);

  const toggleGenre = (slug: string) => {
    setSelectedGenres(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSortOrder('');
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      {/* Header và Ô Tìm Kiếm */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Tìm kiếm Truyện</h1>
        <div className="form-control sticky top-20 z-40">
          <label className="input input-bordered flex items-center gap-2 shadow-lg">
            <FiSearch className="text-xl text-base-content/50" />
            <input
              type="text"
              className="grow"
              placeholder="Nhập tên truyện bạn muốn tìm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus // Tự động focus vào ô tìm kiếm khi vào trang
            />
          </label>
        </div>
        {/* Bộ lọc nâng cao */}
        <div className="mt-4 grid gap-3">
          {/* Thể loại */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Thể loại</h3>
              <div className="flex items-center gap-2">
                {selectedGenres.length > 0 && (
                  <button className="btn btn-xs" onClick={clearFilters}>Xóa lọc</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {allGenres.map(g => (
                <label key={g._id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${selectedGenres.includes(g.slug) ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-200'}`}>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedGenres.includes(g.slug)}
                    onChange={() => toggleGenre(g.slug)}
                  />
                  <span className="text-sm truncate">{g.name}</span>
                </label>
              ))}
              {allGenres.length === 0 && (
                <div className="text-sm text-base-content/60">Không có thể loại.</div>
              )}
            </div>
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-3">
            <span className="font-semibold">Sắp xếp:</span>
            <select className="select select-bordered select-sm w-40" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
              <option value="">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
            {selectedGenres.length > 0 && (
              <div className="text-sm opacity-70">Đã chọn {selectedGenres.length} thể loại</div>
            )}
          </div>
        </div>
      </header>

      {/* Khu vực hiển thị kết quả */}
      <main>
        {isLoading ? (
          // 1. Nếu đang tải dữ liệu ban đầu -> Hiển thị spinner
          <div className="text-center py-16">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : (
          // 2. Nếu đã tải xong -> Hiển thị nội dung
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {/* Tiêu đề động: Hiển thị "Kết quả cho..." hoặc "Truyện phổ biến" */}
              {searchTerm.trim() || selectedGenres.length > 0 || sortOrder
                ? `Kết quả (${filteredMangas.length})`
                : "Truyện Phổ Biến"
              }
            </h2>

            {/* Luôn hiển thị MangaGrid với dữ liệu đã được lọc */}
            <MangaGrid mangas={filteredMangas} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;