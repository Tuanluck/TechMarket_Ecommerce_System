import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = '404 - Không tìm thấy trang - TechMarket';
  }, []);

  return (
    <div className="min-h-[500px] flex flex-col justify-center items-center text-center px-4 space-y-6">
      <div className="text-8xl">🔍</div>
      <h1 className="text-4xl font-black text-gray-800">404 - Không tìm thấy trang</h1>
      <p className="text-gray-500 max-w-md">
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống. Vui lòng quay lại trang chủ.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg"
      >
        Quay lại trang chủ
      </Link>
    </div>
  );
}
