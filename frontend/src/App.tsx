import { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthListener from './components/auth/AuthListener';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import NotFound from './pages/NotFound';
import { ContentHiddenProvider } from './context/ContentHiddenContext';

// 2. Chuyển đổi các trang (Pages) sang Lazy Load
const OfflinePage = lazy(() => import('./pages/OfflinePage'));

// User Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Search = lazy(() => import('./pages/Search'));
const Genre = lazy(() => import('./pages/Genre'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const DetailManga = lazy(() => import('./pages/DetailManga'));
const DetailChapter = lazy(() => import('./pages/DetailChapter'));
const DetailGenre = lazy(() => import('./pages/DetailGenre'));
const Profile = lazy(() => import('./pages/Profile'));
const HentaiList = lazy(() => import('./pages/HentaiList'));
const HentaiDetail = lazy(() => import('./pages/HentaiDetail'));

// Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const MangaAdmin = lazy(() => import('./pages/admin/Manga'));
const GenreAdmin = lazy(() => import('./pages/admin/Genre'));
const ChapterAdmin = lazy(() => import('./pages/admin/Chapter'));
const LayoutAdmin = lazy(() => import('./components/layout/LayoutAdmin'));
const BannerAdmin = lazy(() => import('./pages/admin/Banner'));
const PromotionAdmin = lazy(() => import('./pages/admin/Promotion'));
const NotificationAdmin = lazy(() => import('./pages/admin/Notification'));
const ReportAdmin = lazy(() => import('./pages/admin/Report'));

// Guards (Giữ nguyên import thường hoặc lazy đều được, nhưng import thường an toàn hơn cho logic)
import AdminRouteGuard from './components/auth/AdminRouteGuard';
import AuthRouteGuard from './components/auth/AuthRouteGuard';
import { useNetworkStatus } from './hook/useNetworkStatus';
import { FiWifiOff, FiX } from 'react-icons/fi';
import SettingsAdmin from './pages/admin/SettingsAdmin';


const LoadingFallback = () => (
  <div className="flex flex-col justify-center items-center h-[60vh]">
    <span className="loading loading-spinner loading-lg text-primary"></span>
    <p className="mt-4 text-base-content/70 animate-pulse">Đang tải...</p>
  </div>
);

const App = () => {
  const isOnline = useNetworkStatus();
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);

  // Khi mạng có lại thì reset banner để lần sau mất mạng nó lại hiện
  useEffect(() => {
    if (isOnline) {
      setShowOfflineBanner(true);
    }
  }, [isOnline]);

  return (
    <div className="flex flex-col min-h-screen">
      <ContentHiddenProvider>
        <Router>
          <Toaster position="bottom-right" reverseOrder={false} />
          <AuthListener />

          <Navbar />

        {!isOnline && showOfflineBanner && (
          <div className="bg-error text-error-content px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 sticky top-0 z-[100] transition-all">
            <FiWifiOff />
            <span className="flex-1">
              Bạn đang Offline. Một số hình ảnh hoặc tính năng có thể không hoạt động.
              <a href="/offline" className="underline hover:text-white ml-2">Đến Tủ sách Offline</a>
            </span>
            <button
              onClick={() => setShowOfflineBanner(false)}
              className="btn btn-ghost btn-xs btn-circle text-current hover:bg-black/10"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        )}

        <main className="flex-grow">
          {/* 4. Bọc Routes bằng Suspense */}
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/manga/:slug" element={<DetailManga />} />
              <Route path="/manga/:slug/chapter/:chapterNumber" element={<DetailChapter />} />
              <Route path="/search" element={<Search />} />
              <Route path="/genre" element={<Genre />} />
              <Route path="/genre/:slug" element={<DetailGenre />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/hentai" element={<HentaiList />} />
              <Route path="/hentai/:slug" element={<HentaiDetail />} />

              {/* Protected User Routes */}
              <Route element={<AuthRouteGuard />}>
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<AdminRouteGuard />}>
                <Route path="/admin" element={<LayoutAdmin />}>
                  <Route index element={<Dashboard />} />
                  <Route path="settings" element={<SettingsAdmin />} />
                  <Route path="banners" element={<BannerAdmin />} />
                  <Route path="promotions" element={<PromotionAdmin />} />
                  <Route path="mangas" element={<MangaAdmin />} />
                  <Route path="genres" element={<GenreAdmin />} />
                  <Route path="notifications" element={<NotificationAdmin />} />
                  <Route path="reports" element={<ReportAdmin />} />
                  <Route path="mangas/:mangaName/:mangaId" element={<ChapterAdmin />} />
                </Route>
              </Route>

              <Route path="/offline" element={<OfflinePage />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </Router>
      </ContentHiddenProvider>
    </div>
  );
}

export default App;