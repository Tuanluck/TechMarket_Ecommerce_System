import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductGrid from '../components/product/ProductGrid';
import EmptyState from '../components/common/EmptyState';
import { Link } from 'react-router-dom';

export default function WishlistPage() {
  const { wishlist } = useAuth();

  useEffect(() => {
    document.title = 'Danh sách yêu thích - TechMarket';
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800">Danh sách yêu thích của tôi</h1>
        <p className="text-sm text-gray-500">Các sản phẩm bạn đang quan tâm và theo dõi</p>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          title="Danh sách yêu thích rỗng"
          message="Hãy quay lại trang chủ và chọn những sản phẩm bạn yêu thích bằng cách click vào biểu tượng trái tim."
          icon="❤️"
        >
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </EmptyState>
      ) : (
        <ProductGrid products={wishlist} />
      )}
    </div>
  );
}
