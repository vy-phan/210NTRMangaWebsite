import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiImage,
  FiArrowLeftCircle,
  FiMenu,
  FiX,
  FiGrid,
  FiMonitor,
  FiBell
} from 'react-icons/fi';

const AdminSidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hàm đóng sidebar khi click vào link (trên mobile)
  const closeMobileMenu = () => setIsMobileOpen(false);

  // Class chung cho các link
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${isActive
      ? 'bg-primary text-primary-content shadow-md'
      : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
    }`;

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON (Chỉ hiện trên màn hình nhỏ) --- */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="btn btn-circle btn-primary shadow-lg"
        >
          {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* --- OVERLAY (Lớp phủ đen khi mở menu trên mobile) --- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* --- SIDEBAR CHÍNH --- */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40
        h-screen w-72 
        bg-base-200 border-r border-base-300
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>

        {/* 1. LOGO AREA */}
        <div className="p-6 border-b border-base-300/50">
          <Link to="/admin" className="flex items-center gap-2" onClick={closeMobileMenu}>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Admin Pannel
            </span>
          </Link>
        </div>

        {/* 2. MENU CONTENT */}
        <div className="flex-grow overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">

          {/* Nhóm: Dashboard */}
          <div>
            <p className="px-4 text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">
              Tổng quan
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin" end className={navLinkClasses} onClick={closeMobileMenu}>
                <FiHome size={20} />
                Dashboard
              </NavLink>
            </nav>
          </div>

          {/* Nhóm: Quản lý Dữ liệu */}
          <div>
            <p className="px-4 text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">
              Quản lý nội dung
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin/mangas" className={navLinkClasses} onClick={closeMobileMenu}>
                <FiBook size={20} />
                Danh sách Truyện
              </NavLink>
              <NavLink to="/admin/genres" className={navLinkClasses} onClick={closeMobileMenu}>
                <FiGrid size={20} />
                Danh sách Thể loại
              </NavLink>
              {/* Bạn có thể thêm Quản lý User/Chapter ở đây sau này */}
            </nav>
          </div>

          {/* Nhóm: Cấu hình Website */}
          <div>
            <p className="px-4 text-xs font-bold text-base-content/40 uppercase tracking-wider mb-2">
              Cấu hình & Giao diện
            </p>
            <nav className="space-y-1">
              <NavLink to="/admin/banners" className={navLinkClasses} onClick={closeMobileMenu}>
                <FiImage size={20} />
                Banner & Slider
              </NavLink>
              <NavLink to="/admin/promotions" className={navLinkClasses} onClick={closeMobileMenu}>
                <FiMonitor size={20} />
                Header Truyện Đề Cử
              </NavLink>
              <NavLink to="/admin/notifications" className={navLinkClasses} onClick={closeMobileMenu}>
                <FiBell size={20} />
                Thông báo
              </NavLink>
            </nav>
          </div>

        </div>

        {/* 3. FOOTER (Về trang chủ) */}
        <div className="p-4 border-t border-base-300 bg-base-200/50">
          <Link
            to="/"
            className="btn btn-outline btn-block gap-2 group hover:btn-primary"
          >
            <FiArrowLeftCircle className="group-hover:-translate-x-1 transition-transform" />
            Về Trang Chủ
          </Link>
        </div>

      </aside>
    </>
  );
};

export default AdminSidebar;