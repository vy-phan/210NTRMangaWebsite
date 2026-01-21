import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import { getAllMangasAPI } from '../api/mangaApi';
import { getAllGenresAPI } from '../api/genreApi';
import MangaGrid from '../components/manga/MangaGrid';

const Search = () => {
  const [allMangas, setAllMangas] = useState<Manga[]>([]);
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | ''>('');
  
  // State lọc danh mục
  const [selectedCategory, setSelectedCategory] = useState<'Manga' | 'Manhwa' | ''>('');
  
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch data
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
  }, []);

  // 2. Logic lọc (ĐÃ SỬA)
  const filteredMangas = useMemo(() => {
    let list = allMangas;

    // Lọc theo từ khóa
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q));
    }

    // Lọc theo danh mục (QUAN TRỌNG: Logic này phải chạy trước hoặc sau đều được, miễn là có)
    if (selectedCategory) {
      list = list.filter(m => m.category === selectedCategory);
    }

    // Lọc theo thể loại
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

    // Logic hiển thị mặc định: Nếu KHÔNG có bộ lọc nào được chọn
    // (ĐÃ SỬA: Thêm điều kiện !selectedCategory)
    if (!searchTerm.trim() && selectedGenres.length === 0 && !sortOrder && !selectedCategory) {
      return list.slice(0, 12);
    }
    
    return list;
  }, [allMangas, searchTerm, selectedGenres, sortOrder, selectedCategory]); // <--- ĐÃ SỬA: Thêm selectedCategory vào đây

  const toggleGenre = (slug: string) => {
    setSelectedGenres(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSortOrder('');
    setSelectedCategory(''); // <--- ĐÃ SỬA: Reset cả danh mục
    setSearchTerm('');      // Nên reset cả ô tìm kiếm cho triệt để
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Tìm kiếm Truyện</h1>
        
        {/* Ô tìm kiếm */}
        <div className="form-control sticky top-20 z-40 mb-4">
          <label className="input input-bordered flex items-center gap-2 shadow-lg bg-base-100">
            <FiSearch className="text-xl text-base-content/50" />
            <input
              type="text"
              className="grow"
              placeholder="Nhập tên truyện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
             {/* Nút Xóa lọc nhanh nếu có filter */}
             {(searchTerm || selectedCategory || sortOrder || selectedGenres.length > 0) && (
                 <button onClick={clearFilters} className="btn btn-ghost btn-xs text-error">Xóa bộ lọc</button>
             )}
          </label>
        </div>

        {/* Khu vực Bộ lọc */}
        <div className="bg-base-200 p-4 rounded-box">
            <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* 1. Chọn Danh mục */}
                <div className="form-control">
                    <label className="label py-1 font-semibold text-xs uppercase opacity-70">Phân loại</label>
                    <select 
                        className="select select-bordered select-sm w-full max-w-xs" 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value as any)}
                    >
                        <option value="">Tất cả</option>
                        <option value="Manga">🇯🇵 Manga</option>
                        <option value="Manhwa">🇰🇷 Manhwa</option>
                    </select>
                </div>

                {/* 2. Chọn Sắp xếp */}
                <div className="form-control">
                    <label className="label py-1 font-semibold text-xs uppercase opacity-70">Sắp xếp</label>
                    <select 
                        className="select select-bordered select-sm w-full max-w-xs" 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value as any)}
                    >
                        <option value="">Mặc định</option>
                        <option value="newest">Mới cập nhật</option>
                        <option value="oldest">Cũ nhất</option>
                    </select>
                </div>
            </div>

            {/* 3. Chọn Thể loại */}
            <div className="collapse collapse-arrow bg-base-100 border border-base-300">
                <input type="checkbox" /> 
                <div className="collapse-title font-semibold text-sm">
                    Lọc theo Thể loại ({selectedGenres.length})
                </div>
                <div className="collapse-content">
                    <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {allGenres.map(g => (
                        <label key={g._id} className={`cursor-pointer flex items-center gap-2 p-2 rounded border text-xs transition-colors ${selectedGenres.includes(g.slug) ? 'border-primary bg-primary text-primary-content' : 'border-base-300 hover:bg-base-200'}`}>
                        <input
                            type="checkbox"
                            className="checkbox checkbox-xs hidden"
                            checked={selectedGenres.includes(g.slug)}
                            onChange={() => toggleGenre(g.slug)}
                        />
                        <span className="truncate">{g.name}</span>
                        </label>
                    ))}
                    </div>
                </div>
            </div>
        </div>
      </header>

      <main>
        {isLoading ? (
          <div className="text-center py-16">
            <span className="loading loading-dots loading-lg text-primary"></span>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              {searchTerm.trim() || selectedGenres.length > 0 || sortOrder || selectedCategory
                ? `Kết quả tìm kiếm (${filteredMangas.length})`
                : "Truyện đề xuất"
              }
            </h2>
            
            {filteredMangas.length === 0 ? (
                 <div className="text-center py-10 opacity-60">Không tìm thấy truyện nào.</div>
            ) : (
                <MangaGrid mangas={filteredMangas} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;