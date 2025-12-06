import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiUsers, FiBookOpen, FiTag, FiPieChart, FiBarChart } from 'react-icons/fi';
import { getLengthUsersAPI } from '../../api/authApi';
import { getLengthGenresAPI } from '../../api/genreApi';
import { getLengthMangasAPI, getAllMangasAPI } from '../../api/mangaApi';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

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

const DashboardSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
    <div className="skeleton h-32 w-full"></div>
    <div className="skeleton h-32 w-full"></div>
    <div className="skeleton h-32 w-full"></div>
  </div>
);

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'Ongoing': { label: 'Đang tiến hành', color: '#FBBD23' }, // Vàng
  'Completed': { label: 'Đã hoàn thành', color: '#36D399' }, // Xanh ngọc
  'Cancelled': { label: 'Đã hủy', color: '#F87272' }, // Đỏ
  'Unknown': { label: 'Khác', color: '#A6ADBB' }  // Xám (Mặc định)
};

// Component Tooltip tùy chỉnh
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-base-200 border border-base-300 p-3 rounded-lg shadow-xl opacity-95">
        {/* Tiêu đề: Tên trạng thái (màu theo biểu đồ) */}
        <p className="font-bold text-sm mb-1" style={{ color: data.payload.color }}>
          {data.name}
        </p>

        {/* Nội dung: Số lượng */}
        <div className="flex items-center gap-2 text-base-content">
          <span className="text-xs opacity-70">Số lượng:</span>
          <span className="font-mono font-bold text-md">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

// --- Component Dashboard Chính ---
const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    mangas: 0,
    genres: 0,
  });

  // State cho dữ liệu biểu đồ
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [genreData, setGenreData] = useState<{ name: string; value: number }[]>([]);

  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [userCount, mangaCount, genreCount, allMangas] = await Promise.all([
          getLengthUsersAPI(),
          getLengthMangasAPI(),
          getLengthGenresAPI(),
          getAllMangasAPI(), // Lấy toàn bộ truyện để phân tích
        ]);

        setStats({
          users: userCount,
          mangas: mangaCount,
          genres: genreCount,
        });

        // --- 1. Xử lý dữ liệu cho biểu đồ Trạng thái (Ongoing/Completed) ---
        const statusCounts: Record<string, number> = {};
        allMangas.forEach(manga => {
          const status = manga.status || 'Unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const formatStatusData = Object.keys(statusCounts).map(key => {
          const config = STATUS_CONFIG[key] || STATUS_CONFIG['Unknown'];

          return {
            name: config.label,
            value: statusCounts[key],
            color: config.color
          };
        });

        setStatusData(formatStatusData);


        // --- 2. Xử lý dữ liệu cho biểu đồ Thể loại (Top 5) ---
        const genreCounts: Record<string, number> = {};
        allMangas.forEach(manga => {
          if (Array.isArray(manga.genres)) {
            manga.genres.forEach((g: any) => {
              // Kiểm tra nếu g là object (đã populate) hay string id
              const genreName = typeof g === 'string' ? 'Unknown' : g.name;
              genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
            });
          }
        });

        // Sắp xếp và lấy Top 5 thể loại phổ biến nhất
        const sortedGenres = Object.entries(genreCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));

        setGenreData(sortedGenres);

      } catch (error) {
        toast.error("Không thể tải dữ liệu thống kê.");
        console.error(error);
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

      {/* --- KHU VỰC BIỂU ĐỒ --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Biểu đồ 1: Phân bố theo Trạng thái */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <FiPieChart className="text-primary" />
              Trạng thái Truyện
            </h2>
            <div className="h-64 w-full">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry,index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-base-content/50">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        </div>

        {/* Biểu đồ 2: Top 5 Thể loại phổ biến */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title flex items-center gap-2">
              <FiBarChart className="text-secondary" />
              Top 5 Thể loại Phổ biến
            </h2>
            <div className="h-64 w-full">
              {genreData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={index % 2 === 0 ? '#3ABFF8' : '#36D399'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-base-content/50">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;