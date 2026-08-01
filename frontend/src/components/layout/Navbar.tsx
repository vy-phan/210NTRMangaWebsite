import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { FiSun, FiMoon, FiMenu, FiLogOut, FiEyeOff, FiEye, FiX } from 'react-icons/fi';
import { getActiveNotificationAPI } from '../../api/notificationApi';
import { logoutAPI } from '../../api/authApi';
import { ASSETS } from '../../constants/assets';
import { useContentHidden } from '../../context/ContentHiddenContext';
import BottomNavigation from './BottomNavigation';

const Navbar = () => {
    const { user, logout: logoutFromStore } = useAuthStore();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const { isContentHidden, toggleContentHidden } = useContentHidden();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [showNotification, setShowNotification] = useState(true);
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');


    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const fetchNotification = async () => {
            const data = await getActiveNotificationAPI();
            setNotification(data);
        }
        fetchNotification();
    }, []);

    const handleVisibilityChange = () => {
        toggleContentHidden();
    };

    const handleThemeChange = () => {
        const newTheme = theme === 'light' ? 'night' : 'light';
        setTheme(newTheme);
    };

    const handleLogout = async () => {
        try {
            await logoutAPI();
        } catch (error) {
            console.error(error);
        } finally {
            logoutFromStore();
        }
    };

    const navLinks = (
        <>
            <li><NavLink to="/search">Tìm kiếm</NavLink></li>
            <li><NavLink to="/genre">Thể Loại</NavLink></li>
            <li><NavLink to="/offline">Offline</NavLink></li>
            <li><NavLink to="/history">Lịch sử</NavLink></li>
        </>
    );

    return (
        <>
            <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <FiMenu className="h-5 w-5" />
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            {navLinks}
                        </ul>
                    </div>
                    <Link to="/" className="btn btn-ghost p-1 h-auto min-h-0 hover:bg-transparent">
                        <img
                            // Logic đổi ảnh theo theme
                            src={theme === 'light' ? ASSETS.LOGO_LIGHT : ASSETS.LOGO_NIGHT}
                            alt="210 NTR Manga"
                            className="h-10 md:h-14 md:pl-20 w-auto object-contain transition-all duration-300"
                        />
                    </Link>
                </div>

                {/* --- Navbar Center (Desktop) --- */}
                <nav className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {navLinks}
                    </ul>
                </nav>

                {/* --- Navbar End --- */}
                <div className="navbar-end gap-2">
                    <button
                        onClick={handleVisibilityChange}
                        className="btn btn-ghost btn-circle"
                        aria-label="Toggle content visibility"
                        title={isContentHidden ? "Hiện nội dung" : "Ẩn nội dung"}
                    >
                        {isContentHidden ? <FiEyeOff className="h-6 w-6" /> : <FiEye className="h-6 w-6" />}
                    </button>

                    <button onClick={handleThemeChange} className="btn btn-ghost btn-circle" aria-label="Toggle theme">
                        {theme === 'light' ? <FiMoon className="h-6 w-6" /> : <FiSun className="h-6 w-6" />}
                    </button>

                    {user ? (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                                    <img
                                        alt="User Avatar"
                                        src={user.avatarUrl ? user.avatarUrl : ASSETS.DEFAULT_AVATAR(user.displayName)}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-md dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                                <li className="font-semibold p-2 pointer-events-none">{user.displayName}</li>
                                <div className="divider my-0"></div>
                                <li><Link to="/profile">Hồ sơ</Link></li>
                                {
                                    user.role == 'admin' && (
                                        <>
                                            <li><Link to="/admin">Quản trị</Link></li>
                                        </>
                                    )
                                }
                                <li>
                                    <button onClick={handleLogout} className="text-error">
                                        <FiLogOut /> Đăng xuất
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary">
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </header>

            {/* --- Banner Thông báo --- */}
            {notification && showNotification && !isAdminRoute && (
                <div className={`
                    sticky top-[64px] z-[40] px-4 py-2.5 text-center text-xs md:text-sm font-medium 
                    flex items-center justify-center gap-2 backdrop-blur-md border-b 
                    animate-in slide-in-from-top duration-300
                    ${theme === 'light'
                        ? 'bg-amber-100/70 border-amber-400/30 text-amber-900 shadow-sm'
                        : 'bg-yellow-400/10 border-yellow-400/20 text-yellow-200'
                    }
                `}>
                    <span className="flex-1 tracking-wide">{notification.content}</span>
                    <button
                        onClick={() => setShowNotification(false)}
                        className={`
                            p-1.5 rounded-full transition-colors duration-200 flex items-center justify-center
                            ${theme === 'light' ? 'hover:bg-amber-200/50' : 'hover:bg-yellow-400/20'}
                        `}
                        aria-label="Close notification"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* --- Bottom Navigation (Mobile Only) --- */}
            <BottomNavigation />
        </>
    );
};

export default Navbar;
