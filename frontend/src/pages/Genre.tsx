import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import { getAllGenresAPI } from '../api/genreApi';

const Genre = () => {
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoading(true);
        const data = await getAllGenresAPI();
        setAllGenres(data);
      } catch (err) {
        setError('Không thể tải danh sách thể loại.');
        toast.error('Lỗi khi tải dữ liệu!');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenres();
  }, []);

  // Lọc danh sách genres dựa trên thanh tìm kiếm
  const filteredGenres = useMemo(() => {
    return allGenres.filter(genre =>
      genre.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allGenres, searchTerm]);

  // Nhóm các thể loại đã lọc theo chữ cái đầu
  const groupedGenres = useMemo(() => {
    return filteredGenres.reduce((acc, genre) => {
      const firstLetter = genre.name[0]?.toUpperCase().match(/[A-Z]/) ? genre.name[0].toUpperCase() : '#';
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(genre);
      return acc;
    }, {} as Record<string, Genre[]>);
  }, [filteredGenres]);

  const alphabet = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

  // Các trạng thái UI
  if (isLoading) return <div className="flex justify-center items-center h-96"><span className="loading loading-ball loading-lg"></span></div>;
  if (error) return <div role="alert" className="alert alert-error"><span>{error}</span></div>;

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header và Thanh lọc */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Tất cả Thể loại</h1>
        {/* Thanh A-Z */}
        <div className="join flex-wrap">
          {alphabet.map(letter => (
            <a key={letter} href={`#genre-group-${letter}`} className="join-item btn btn-ghost btn-sm">
              {letter}
            </a>
          ))}
        </div>
        {/* Thanh tìm kiếm */}
        <div className="mt-4 max-w-lg">
          <label className="input input-bordered flex items-center gap-2">
            <FiSearch className="text-base-content/50" />
            <input
              type="text"
              className="grow"
              placeholder="Tìm kiếm thể loại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>
      </header>

      {/* Danh sách thể loại dạng lưới */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
        {Object.keys(groupedGenres).sort().map(letter => (
          <div key={letter} id={`genre-group-${letter}`} className="pt-4"> {/* pt-4 để không bị che bởi navbar khi nhảy link */}
            <h2 className="text-2xl font-bold mb-3 border-b-2 border-primary pb-1">{letter}</h2>
            <ul className="space-y-2">
              {groupedGenres[letter].map(genre => (
                <li key={genre._id}>
                  <Link 
                    to={`/genre/${genre.slug}`} 
                    className="flex justify-between items-center p-3 bg-base-200 hover:bg-primary hover:text-primary-content rounded-lg transition-all duration-200 group"
                  >
                    <span className="font-semibold group-hover:pl-1 transition-all duration-200">{genre.name}</span>
                    <span className="badge badge-neutral">{genre.count?.toLocaleString() || 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Genre;