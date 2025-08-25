import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiUsers, FiBookOpen, FiTag, FiBarChart2 } from 'react-icons/fi';
import { getLengthMangasAPI } from '../../api/mangaApi';
import { getLengthUsersAPI } from '../../api/authApi';
import { getLengthGenresAPI } from '../../api/genreApi';


// Component con cho mỗi card thống kê
interface StatCardProps {
  icon: React.ReactElement;
  title: string;
  value: number | string;
  description: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, description, colorClass }) => (
  <div className={`stat bg-base-100 shadow-lg rounded-box border-l-4 ${colorClass}`}>
    <div className="stat-figure text-primary">{icon}</div>
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-desc">{description}</div>
  </div>
);


// Component Skeleton cho Dashboard
const DashboardSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
    <div className="skeleton h-32 w-full"></div>
    <div className="skeleton h-32 w-full"></div>
    <div className="skeleton h-32 w-full"></div>
  </div>
);


const Dashboard = () => {
  // State để lưu trữ các số liệu
  const [stats, setStats] = useState({
    users: 0,
    mangas: 0,
    genres: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // useEffect để fetch tất cả dữ liệu thống kê khi component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Sử dụng Promise.all để gọi đồng thời 3 API
        const [userCount, mangaCount, genreCount] = await Promise.all([
          getLengthUsersAPI(),
          getLengthMangasAPI(),
          getLengthGenresAPI(),
        ]);
        
        setStats({
          users: userCount,
          mangas: mangaCount,
          genres: genreCount,
        });

      } catch (error) {
        toast.error("Không thể tải dữ liệu thống kê.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-base-content/70 mt-1">Tổng quan về dữ liệu hệ thống.</p>
      </header>

      {/* Lưới hiển thị các card thống kê */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<FiUsers className="text-4xl" />}
          title="Tổng Người Dùng"
          value={stats.users.toLocaleString()}
          description="Tất cả người dùng đã đăng ký"
          colorClass="border-info"
        />
        <StatCard
          icon={<FiBookOpen className="text-4xl" />}
          title="Tổng Số Truyện"
          value={stats.mangas.toLocaleString()}
          description="Số lượng truyện trong hệ thống"
          colorClass="border-success"
        />
        <StatCard
          icon={<FiTag className="text-4xl" />}
          title="Tổng Thể Loại"
          value={stats.genres.toLocaleString()}
          description="Số lượng thể loại khả dụng"
          colorClass="border-warning"
        />
      </div>

      {/* Khu vực cho biểu đồ (placeholder) */}
      <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
              <h2 className="card-title">
                  <FiBarChart2 />
                  Thống kê Lượt truy cập (Placeholder)
              </h2>
              <div className="flex justify-center items-center h-64 bg-base-200 rounded-box">
                  <p>Biểu đồ sẽ được tích hợp ở đây.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;