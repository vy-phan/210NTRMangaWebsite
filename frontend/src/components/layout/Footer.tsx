import { useState, useEffect } from "react";
import { FaSearch, FaList, FaDownload, FaHistory } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    // Update theme state if it changes elsewhere (optional simple listener)
    useEffect(() => {
        const handleStorageChange = () => {
            setTheme(localStorage.getItem('theme') || 'light');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <footer className="bg-base-300 text-base-content font-sans mt-auto border-t border-base-200">
            {/* Main Footer Links - Internal Navigation */}
            <div className="container mx-auto p-10 max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10">

                    {/* Brand & Socials */}
                    <div className="flex flex-col items-center md:items-start gap-6 max-w-sm">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="btn btn-ghost p-0 h-auto min-h-0 hover:bg-transparent">
                                <img
                                    src={theme === 'light' ? '/logoLight.png' : '/logoNight.png'}
                                    alt="210 NTR Manga"
                                    className="h-12 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
                                />
                            </Link>
                            <span className="font-extrabold text-2xl tracking-tight hidden md:block">210 NTR Manga</span>
                        </div>
                        <p className="text-center md:text-left text-sm opacity-70 leading-relaxed">
                            Nền tảng đọc truyện tranh trực tuyến mượt mà, giao diện hiện đại và trải nghiệm người dùng tối ưu.
                        </p>

                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                        <h6 className="footer-title opacity-100 text-primary uppercase tracking-widest text-sm font-bold border-b-2 border-primary/20 pb-1">Các Trang</h6>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-4 text-sm font-medium">
                            <Link to="/search" className="group flex items-center gap-2 hover:text-primary transition-colors">
                                <FaSearch className="text-xs opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span>Tìm kiếm</span>
                            </Link>
                            <Link to="/genre" className="group flex items-center gap-2 hover:text-primary transition-colors">
                                <FaList className="text-xs opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span>Thể Loại</span>
                            </Link>
                            <Link to="/offline" className="group flex items-center gap-2 hover:text-primary transition-colors">
                                <FaDownload className="text-xs opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span>Offline</span>
                            </Link>
                            <Link to="/history" className="group flex items-center gap-2 hover:text-primary transition-colors">
                                <FaHistory className="text-xs opacity-50 group-hover:opacity-100 transition-opacity" />
                                <span>Lịch sử</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>


            {/* Copyright Section */}
            <div className="bg-base-300 border-t border-base-content/5 p-4 text-center">
                <p className="text-xs opacity-60">
                    Copyright © {new Date().getFullYear()} - Designed and developed by <span className="font-bold text-primary hover:underline cursor-pointer">VyPhan Rekid</span>
                </p>
            </div>
        </footer>
    )
}

export default Footer

