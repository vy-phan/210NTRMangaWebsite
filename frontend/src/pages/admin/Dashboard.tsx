import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiUsers, FiBookOpen, FiTag, FiPieChart, FiBarChart, FiFileText, FiTrendingUp, FiLayers } from 'react-icons/fi';
import { getLengthUsersAPI } from '../../api/authApi';
import { getLengthGenresAPI } from '../../api/genreApi';
import { getLengthMangasAPI, getMangaStatsAPI } from '../../api/mangaApi';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';

interface StatCardProps {
  icon: React.ReactElement;
  title: string;
  value: number | string;
  description: string;
  colorClass: string;
  bgClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, description, colorClass, bgClass }) => (
  <div className="relative overflow-hidden bg-base-100 p-6 rounded-3xl shadow-sm border border-base-200/50 hover:shadow-md transition-all duration-300 group">
    {/* Decorative background glow */}
    <div className={`absolute -right-8 -top-8 w-32 h-32 blur-3xl rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${bgClass}`}></div>

    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-sm font-semibold text-base-content/50 mb-1 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-base-content tracking-tight">{value}</h3>
      </div>
      <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 backdrop-blur-sm shadow-inner`}>
        {icon}
      </div>
    </div>
    <div className="text-sm text-base-content/60 flex items-center gap-2 relative z-10 font-medium">
      {description}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-10 w-48 bg-base-200 rounded-lg"></div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-base-200 rounded-3xl"></div>)}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="h-[400px] bg-base-200 rounded-3xl xl:col-span-2"></div>
      <div className="h-[400px] bg-base-200 rounded-3xl xl:col-span-1"></div>
    </div>
  </div>
);

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  'Ongoing': { label: 'Đang tiến hành', color: '#FBBF24' }, // user-friendly yellow
  'Completed': { label: 'Đã hoàn thành', color: '#10B981' }, // emerald green
  'Cancelled': { label: 'Đã hủy', color: '#F43F5E' }, // rose red
  'Unknown': { label: 'Khác', color: '#94A3B8' }  // slate
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-base-100/95 backdrop-blur-md border border-base-300 p-4 rounded-2xl shadow-xl min-w-[160px]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.payload.color }}></div>
          <p className="font-bold text-sm text-base-content">{data.name}</p>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold">{data.value}</span>
          <span className="text-xs text-base-content/60 font-medium uppercase tracking-wide">truyện</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-base-100/95 backdrop-blur-md border border-base-300 p-4 rounded-2xl shadow-xl min-w-[180px]">
        <p className="font-semibold text-sm text-base-content/60 mb-3 border-b border-base-200 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
              <span className="text-sm font-medium text-base-content/90">{entry.name}</span>
            </div>
            <span className="font-bold text-lg">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    mangas: 0,
    genres: 0,
    chapters: 0,
  });

  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [genreData, setGenreData] = useState<{ name: string; value: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [growthData, setGrowthData] = useState<{ date: string; count: number }[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [userCount, mangaCount, genreCount, statsData] = await Promise.all([
          getLengthUsersAPI(),
          getLengthMangasAPI(),
          getLengthGenresAPI(),
          getMangaStatsAPI(),
        ]);

        setStats({
          users: userCount,
          mangas: mangaCount,
          genres: genreCount,
          chapters: statsData.totalChapters,
        });

        // --- 1. Xử lý dữ liệu cho biểu đồ Trạng thái ---
        const formatStatusData = statsData.statusStats.map((stat: any) => {
          const config = STATUS_CONFIG[stat.status] || STATUS_CONFIG['Unknown'];
          return {
            name: config.label,
            value: stat.count,
            color: config.color
          };
        });
        setStatusData(formatStatusData);

        // --- 2. Xử lý dữ liệu cho biểu đồ Thể loại ---
        const formatGenreData = statsData.genreStats.map((stat: any) => ({
          name: stat.name,
          value: stat.count
        }));
        setGenreData(formatGenreData);

        // --- 3. Xử lý dữ liệu cho biểu đồ Phân loại (Manga/Manhwa) ---
        const CAT_COLORS: Record<string, string> = { 'Manga': '#6366F1', 'Manhwa': '#14B8A6', 'Manhua': '#F43F5E' };
        const formatCategoryData = statsData.categoryStats.map((stat: any) => ({
          name: stat.category,
          value: stat.count,
          color: CAT_COLORS[stat.category] || '#94A3B8'
        }));
        setCategoryData(formatCategoryData);

        // --- 4. Tăng trưởng ---
        setGrowthData(statsData.growthStats);

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
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-base-content">Dashboard</h1>
          <p className="text-base-content/60 mt-2 text-lg">Tổng quan về hệ thống và cộng đồng của bạn.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-base-200 rounded-xl text-base-content/70 shadow-inner">
          Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </header>

      {/* Lưới hiển thị các card thống kê */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FiUsers className="w-7 h-7" />}
          title="Người Dùng"
          value={stats.users.toLocaleString()}
          description="Thành viên đã đăng ký"
          colorClass="text-info bg-info"
          bgClass="bg-info"
        />
        <StatCard
          icon={<FiBookOpen className="w-7 h-7" />}
          title="Tổng Truyện"
          value={stats.mangas.toLocaleString()}
          description="Đầu truyện trong hệ thống"
          colorClass="text-success bg-success"
          bgClass="bg-success"
        />
        <StatCard
          icon={<FiFileText className="w-7 h-7" />}
          title="Tổng Chapter"
          value={stats.chapters.toLocaleString()}
          description="Chương truyện đã tải lên"
          colorClass="text-primary bg-primary"
          bgClass="bg-primary"
        />
        <StatCard
          icon={<FiTag className="w-7 h-7" />}
          title="Thể Loại"
          value={stats.genres.toLocaleString()}
          description="Đang được phân loại"
          colorClass="text-warning bg-warning"
          bgClass="bg-warning"
        />
      </div>

      {/* --- KHU VỰC BIỂU ĐỒ --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Biểu đồ 1: Tăng trưởng Upload Chapter (7 ngày) */}
        <div className="bg-base-100 shadow-sm border border-base-200/60 rounded-3xl xl:col-span-2 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-xl text-success"><FiTrendingUp size={20} /></div>
              Tăng trưởng Upload Chapter (7 ngày qua)
            </h2>
          </div>
          <div className="flex-grow p-6 h-[400px] w-full mt-4">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="count" name="Số chương mới" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-base-content/40 italic font-medium">Không có dữ liệu upload trong 7 ngày qua.</div>
            )}
          </div>
        </div>

        {/* Biểu đồ 2: Phân bố theo Trạng thái */}
        <div className="bg-base-100 shadow-sm border border-base-200/60 rounded-3xl xl:col-span-1 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="p-6 pb-0 flex-none">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-xl text-warning"><FiPieChart size={20} /></div>
              Tình trạng Truyện
            </h2>
          </div>
          <div className="flex-grow p-6 h-[400px] w-full relative">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-base-content/40 font-medium">Chưa có dữ liệu</div>
            )}

            {statusData.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-10%' }}>
                <div className="text-center">
                  <span className="block text-4xl font-extrabold">{stats.mangas}</span>
                  <span className="block text-xs text-base-content/50 uppercase tracking-widest mt-1">Tổng</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Biểu đồ 3: Top Thể loại phổ biến */}
        <div className="bg-base-100 shadow-sm border border-base-200/60 rounded-3xl xl:col-span-2 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="p-6 pb-0">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-xl text-secondary"><FiBarChart size={20} /></div>
              Top Thể loại Phổ biến
            </h2>
          </div>
          <div className="flex-grow p-6 h-[400px] w-full mt-4">
            {genreData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={genreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip cursor={{ fill: '#F1F5F9', fillOpacity: 0.1 }} content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Số lượng truyện" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {genreData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366F1' : '#8B5CF6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-base-content/40 font-medium">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

        {/* Biểu đồ 4: Phân loại Nguồn gốc */}
        <div className="bg-base-100 shadow-sm border border-base-200/60 rounded-3xl xl:col-span-1 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="p-6 pb-0 flex-none">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl text-accent"><FiLayers size={20} /></div>
              Loại Truyện
            </h2>
          </div>
          <div className="flex-grow p-6 h-[400px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-base-content/40 font-medium">Chưa có dữ liệu</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;