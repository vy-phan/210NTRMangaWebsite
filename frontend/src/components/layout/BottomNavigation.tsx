import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiBook, FiWifiOff, FiClock } from 'react-icons/fi';

const BottomNavigation = () => {
    const location = useLocation();
    
    // Hide bottom navigation on manga detail pages
    const isMangaDetailPage = location.pathname.startsWith('/manga/');
    
    if (isMangaDetailPage) {
        return null;
    }

    return (
        <div className="btm-nav lg:hidden z-50 text-secondary">
            <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
                <FiSearch className="h-5 w-5" />
                <span className="btm-nav-label text-xs">Tìm kiếm</span>
            </NavLink>
            <NavLink to="/genre" className={({ isActive }) => isActive ? 'active' : ''}>
                <FiBook className="h-5 w-5" />
                <span className="btm-nav-label text-xs">Thể Loại</span>
            </NavLink>
            <NavLink 
                to="/" 
                className={({ isActive }) => {
                    const baseClasses = 'rounded-full -mt-4 bg-secondary/10 backdrop-blur-sm border-2 border-secondary/30 shadow-lg transition-all duration-300';
                    const activeClasses = isActive 
                        ? 'bg-secondary/30 border-secondary scale-110' 
                        : 'hover:bg-secondary/20 hover:border-secondary/50 active:scale-95';
                    return `${baseClasses} ${activeClasses}`;
                }
                }
            >
                <FiHome className="h-6 w-6" />
                <span className="btm-nav-label text-xs">Trang chủ</span>
            </NavLink>
            <NavLink to="/offline" className={({ isActive }) => isActive ? 'active' : ''}>
                <FiWifiOff className="h-5 w-5" />
                <span className="btm-nav-label text-xs">Offline</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
                <FiClock className="h-5 w-5" />
                <span className="btm-nav-label text-xs">Lịch sử</span>
            </NavLink>
        </div>
    );
};

export default BottomNavigation;
