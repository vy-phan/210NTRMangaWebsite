import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import { getAllMangasAPI } from '../api/mangaApi';
import MangaGrid from '../components/manga/MangaGrid'; // Tái sử dụng lưới truyện

const Search = () => {
  // State để lưu danh sách manga gốc từ API
  const [allMangas, setAllMangas] = useState<Manga[]>([]);
  // State để lưu từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  // State quản lý loading
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch toàn bộ manga một lần duy nhất khi component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllMangasAPI();
        setAllMangas(data);
      } catch (error) {
        toast.error("Không thể tải danh sách truyện.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

  // 2. Lọc danh sách manga dựa trên `searchTerm`
  //    Sử dụng useMemo để tối ưu, chỉ tính toán lại khi cần
  const filteredMangas = useMemo(() => {
    if (!searchTerm.trim()) {
      // Logic này bây giờ đã ĐÚNG và sẽ được sử dụng
      return allMangas.slice(0, 12);
    }
    return allMangas.filter(manga =>
      manga.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMangas, searchTerm]);

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
              {searchTerm.trim()
                ? `Kết quả cho "${searchTerm}" (${filteredMangas.length})`
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