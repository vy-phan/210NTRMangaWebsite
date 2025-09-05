import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthListener from './components/auth/AuthListener';


import Home from './pages/Home';
import Login from './pages/Login';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import NotFound from './pages/NotFound';
import Search from './pages/Search';
import Genre from './pages/Genre';
import Dashboard from './pages/admin/Dashboard';
import GenreAdmin from './pages/admin/Genre';
import MangaAdmin from './pages/admin/Manga';
import LayoutAdmin from './components/layout/LayoutAdmin';
import AdminRouteGuard from './components/auth/AdminRouteGuard';
import DetailManga from './pages/DetailManga';
import DetailGenre from './pages/DetailGenre';
import ChapterAdmin from './pages/admin/Chapter';
import DetailChapter from './pages/DetailChapter';
import Profile from './pages/Profile';
import AuthRouteGuard from './components/auth/AuthRouteGuard';


function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Router>
        <Toaster position="bottom-right" reverseOrder={false} />
        <AuthListener />


        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manga/:slug" element={<DetailManga />} />
            <Route path="/manga/:slug/chapter/:chapterNumber" element={<DetailChapter />} />
            <Route path="/search" element={<Search />} />
            <Route path="/genre" element={<Genre />} />
            <Route path="/genre/:slug" element={<DetailGenre />} />
            <Route path="/login" element={<Login />} />

            <Route element={<AuthRouteGuard />}>
              <Route path="/profile" element={<Profile />} />

            </Route>


            <Route element={<AdminRouteGuard />}>
              <Route path="/admin" element={<LayoutAdmin />}>
                <Route index element={<Dashboard />} />
                <Route path="mangas" element={<MangaAdmin />} />
                <Route path="genres" element={<GenreAdmin />} />
                <Route path="mangas/:mangaName/:mangaId" element={<ChapterAdmin />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;