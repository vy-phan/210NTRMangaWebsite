import { Suspense, lazy } from 'react'; // 1. Import lazy và Suspense
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthListener from './components/auth/AuthListener';

// Các component cốt lõi (Core) nên giữ import thường để hiển thị ngay lập tức
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import NotFound from './pages/NotFound'; // Trang 404 nhẹ, import thường cũng được

// 2. Chuyển đổi các trang (Pages) sang Lazy Load
// User Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Search = lazy(() => import('./pages/Search'));
const Genre = lazy(() => import('./pages/Genre'));
const DetailManga = lazy(() => import('./pages/DetailManga'));
const DetailChapter = lazy(() => import('./pages/DetailChapter'));
const DetailGenre = lazy(() => import('./pages/DetailGenre'));
const Profile = lazy(() => import('./pages/Profile'));

// Admin Pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const MangaAdmin = lazy(() => import('./pages/admin/Manga'));
const GenreAdmin = lazy(() => import('./pages/admin/Genre'));
const ChapterAdmin = lazy(() => import('./pages/admin/Chapter'));
const LayoutAdmin = lazy(() => import('./components/layout/LayoutAdmin'));

// Guards (Giữ nguyên import thường hoặc lazy đều được, nhưng import thường an toàn hơn cho logic)
import AdminRouteGuard from './components/auth/AdminRouteGuard';
import AuthRouteGuard from './components/auth/AuthRouteGuard';

// 3. Component hiển thị khi đang tải trang (Loading UI)
const LoadingFallback = () => (
  <div className="flex flex-col justify-center items-center h-[60vh]">
    <span className="loading loading-spinner loading-lg text-primary"></span>
    <p className="mt-4 text-base-content/70 animate-pulse">Đang tải...</p>
  </div>
);

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Router>
        <Toaster position="bottom-right" reverseOrder={false} />
        <AuthListener />

        <Navbar />
        
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
              <Route path="/login" element={<Login />} />

              {/* Protected User Routes */}
              <Route element={<AuthRouteGuard />}>
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<AdminRouteGuard />}>
                <Route path="/admin" element={<LayoutAdmin />}>
                  <Route index element={<Dashboard />} />
                  <Route path="mangas" element={<MangaAdmin />} />
                  <Route path="genres" element={<GenreAdmin />} />
                  <Route path="mangas/:mangaName/:mangaId" element={<ChapterAdmin />} />
                </Route>
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </Router>
    </div>
  );
}

export default App;