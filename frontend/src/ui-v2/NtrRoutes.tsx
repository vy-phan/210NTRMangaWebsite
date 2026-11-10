import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthRouteGuard from '../components/auth/AuthRouteGuard';

// Lazy load các trang trong ui-v2
const HomePage = lazy(() => import('./pages/HomePage'));
const UpdatesPage = lazy(() => import('./pages/UpdatesPage'));
const NewMangaPage = lazy(() => import('./pages/NewMangaPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const RandomPage = lazy(() => import('./pages/RandomPage'));
const DetailMangaPage = lazy(() => import('./pages/DetailMangaPage'));
const DetailChapterPage = lazy(() => import('./pages/DetailChapterPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const GenrePage = lazy(() => import('./pages/GenrePage'));
const DetailGenrePage = lazy(() => import('./pages/DetailGenrePage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const FallbackLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh]">
    <span className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--line)', borderTopColor: 'var(--accent)' }} />
  </div>
);

/**
 * NtrRoutes - Entry point duy nhất cho nhánh /ntr/*
 * Dễ dàng bật/tắt hoặc xóa sạch trong tương lai mà không ảnh hưởng UI v1.
 */
const NtrRoutes: React.FC = () => {
  return (
    <Suspense fallback={<FallbackLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="updates" element={<UpdatesPage />} />
          <Route path="new" element={<NewMangaPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="random" element={<RandomPage />} />
          <Route path="manga/:slug" element={<DetailMangaPage />} />
          {/* Trình đọc render bare (không header/tab dưới) nhờ MainLayout check path */}
          <Route path="manga/:slug/chapter/:chapterNumber" element={<DetailChapterPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="genre" element={<GenrePage />} />
          <Route path="genre/:slug" element={<DetailGenrePage />} />
          <Route path="category/:categoryName" element={<CategoryPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="history" element={<HistoryPage />} />

          {/* Protected profile */}
          <Route element={<AuthRouteGuard />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 trong nhánh /ntr */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default NtrRoutes;
