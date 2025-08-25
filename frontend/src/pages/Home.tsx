import { useEffect, useState } from "react";
import Banner from "../components/home/Banner";
import RankingSidebar from "../components/home/RankingSidebar";
import MangaGrid from "../components/manga/MangaGrid";
import { getAllMangasAPI } from "../api/mangaApi";

const Home = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getAllMangasAPI();
        // Sắp xếp theo ngày cập nhật mới nhất
        const sortedData = data.sort((a, b) => 
          new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
        );
        setMangas(sortedData);
      } catch (error) {
        console.error("Failed to fetch mangas", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const rankedMangas = mangas.slice(0, 10);

  return (
    <div>
      <section className="mb-8">
        <Banner />
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-9 col-span-12">
            <div className="bg-base-200 p-4 md:p-6 rounded-box">
              {/* Truyền toàn bộ danh sách truyện vào MangaGrid */}
              <MangaGrid mangas={mangas} isLoading={isLoading} />
            </div>
          </div>

          <div className="lg:col-span-3 col-span-12">
            {/* Truyền 10 truyện top vào RankingSidebar */}
            <RankingSidebar mangas={rankedMangas} title="Mới Cập Nhật" />
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;