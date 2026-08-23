import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ASSETS } from '../constants/assets';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl w-full">
        {/* 404 Image */}
        <div className="mb-8">
          <img
            src={ASSETS.NOT_FOUND}
            alt="404 Not Found"
            className="mx-auto max-w-full h-auto max-h-[400px] w-auto"
            onError={(e) => {
              // Fallback nếu ảnh không load được
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-primary opacity-30 select-none">
            404
          </h1>
        </div>

        {/* Title & Description */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
            Trang không tìm thấy
          </h2>
          <p className="text-base-content/70 text-lg leading-relaxed px-4">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển đến một nơi khác.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <button
            onClick={handleGoHome}
            className="btn btn-primary btn-lg min-w-[180px]"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Về trang chủ
          </button>

          <button
            onClick={handleGoBack}
            className="btn btn-outline btn-lg min-w-[180px]"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;