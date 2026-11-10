import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMangasAPI } from '../../api/mangaApi';

// Truyện ngẫu nhiên: lấy 1 truyện rồi chuyển hướng, thay thế lịch sử trình duyệt
const RandomPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getAllMangasAPI();
        if (!mounted) return;
        if (!list.length) {
          setError(true);
          return;
        }
        const pick = list[Math.floor(Math.random() * list.length)];
        navigate(`/ntr/manga/${pick.slug}`, { replace: true });
      } catch {
        if (mounted) setError(true);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-ink-muted">
      {error ? (
        <>
          <p className="text-sm">Không tải được danh sách truyện.</p>
          <button className="btn-ghost" onClick={() => navigate('/ntr')}>
            Về trang chủ
          </button>
        </>
      ) : (
        <>
          <span className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--line)', borderTopColor: 'var(--accent)' }} />
          <p className="text-sm">Đang chọn một truyện cho bạn…</p>
        </>
      )}
    </div>
  );
};

export default RandomPage;
