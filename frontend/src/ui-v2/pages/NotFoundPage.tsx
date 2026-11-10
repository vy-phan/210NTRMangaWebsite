import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

// Trang 404 của nhánh /ntr — dùng ảnh notFound.webp
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70dvh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <img
        src="/notFound.webp"
        alt="Không tìm thấy trang"
        className="w-56 md:w-72 h-auto rounded-2xl mb-6"
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
      />
      <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">404 — Lạc đường rồi</h1>
      <p className="text-sm text-ink-muted mt-2 max-w-sm">
        Trang bạn tìm không tồn tại hoặc đã được di chuyển. Kiểm tra lại đường dẫn nhé.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        <Link to="/ntr" className="btn-primary">
          <FiHome size={15} /> Về trang chủ
        </Link>
        <Link to="/ntr/search" className="btn-ghost">
          <FiSearch size={15} /> Tìm truyện
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
