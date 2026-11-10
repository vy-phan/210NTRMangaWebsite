import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import '../styles/theme.css';
import '../lib/uiStore'; // áp dụng theme trước khi vẽ

// Trình đọc là trang riêng toàn màn hình — không header/footer/tab dưới
const isReaderPath = (p: string) => /\/ntr\/manga\/[^/]+\/chapter\/[^/]+/.test(p);

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isReader = isReaderPath(location.pathname);

  if (isReader) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
