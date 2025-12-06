import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../config/supabase';
import { FiSun, FiMoon, FiMenu, FiLogOut, FiEyeOff, FiEye } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout: logoutFromStore } = useAuthStore();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [isHidden, setIsHidden] = useState(() => localStorage.getItem('isContentHidden') === 'true');


    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);


    useEffect(() => {
        localStorage.setItem('isContentHidden', isHidden.toString());
        window.dispatchEvent(new Event('storage-local-change'));
    }, [isHidden]);

    const handleVisibilityChange = () => {
        setIsHidden(prev => !prev);
    };

    const handleThemeChange = () => {
        const newTheme = theme === 'light' ? 'night' : 'light';
        setTheme(newTheme);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        logoutFromStore();
    };

    const navLinks = (
        <>
            <li><NavLink to="/search">Tìm kiếm</NavLink></li>
            <li><NavLink to="/genre">Thể Loại</NavLink></li>
        </>
    );

    return (
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
                <Link to="/" className="btn btn-ghost text-xl font-bold p-2">
                    {/* <img src="./logo.png" alt="Logo" className='w-14'/> */}
                    210 NTR Manga
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
                    title={isHidden ? "Hiện nội dung" : "Ẩn nội dung"}
                >
                    {isHidden ? <FiEyeOff className="h-6 w-6" /> : <FiEye className="h-6 w-6" />}
                </button>

                <button onClick={handleThemeChange} className="btn btn-ghost btn-circle" aria-label="Toggle theme">
                    {theme === 'light' ? <FiMoon className="h-6 w-6" /> : <FiSun className="h-6 w-6" />}
                </button>

                {user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img
                                        alt="User Avatar"
                                        src={user.avatarUrl ? user.avatarUrl : `https://ui-avatars.com/api/?name=${user.displayName}`}
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
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
    );
};

export default Navbar;