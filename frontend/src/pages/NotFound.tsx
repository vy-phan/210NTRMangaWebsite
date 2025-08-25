import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div className="text-center max-w-md w-full">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary opacity-20 select-none">
            404
          </h1>
        </div>

        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-error/10 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-error" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-base-content mb-4">
            Trang không tìm thấy
          </h2>
          <p className="text-base-content/70 text-lg leading-relaxed">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleGoHome}
            className="btn btn-primary btn-lg"
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
            className="btn btn-outline btn-lg"
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