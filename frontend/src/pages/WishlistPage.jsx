import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axiosInstance from '../api/axiosInstance';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, loading: authLoading } = useAuth();
  const { fetchCart } = useCart();
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    document.title = 'Danh sách yêu thích - TechMarket';
  }, []);

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) {
      toast.error('Sản phẩm đã hết hàng.');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));
      await axiosInstance.post('/cart/items', {
        productId: product._id,
        quantity: 1
      });
      await fetchCart();
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Danh sách yêu thích của tôi</h1>
          <p className="text-sm text-gray-500">Các sản phẩm bạn đang quan tâm và theo dõi ({wishlist.length})</p>
        </div>
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
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-100"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col relative group"
            >
              {/* Delete Button (Heart Icon toggled) */}
              <button
                onClick={() => toggleWishlist(product._id)}
                className="absolute top-4 right-4 z-10 p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-colors"
                title="Xóa khỏi yêu thích"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              {/* Product Thumbnail */}
              <Link
                to={`/products/${product.slug}`}
                className="w-full h-48 bg-gray-50 rounded-2xl overflow-hidden block border border-gray-50"
              >
                <img
                  src={product.thumbnail || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Product Info */}
              <div className="mt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-bold text-gray-800 hover:text-indigo-600 line-clamp-2 text-sm leading-snug"
                  >
                    {product.name}
                  </Link>
                  <p className="text-lg font-black text-gray-800">{formatPrice(product.basePrice)}</p>
                  
                  {/* Stock Badge */}
                  <div className="pt-1">
                    {product.stock > 0 ? (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Còn hàng ({product.stock})
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        Hết hàng
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart button */}
                <div className="mt-4">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0 || addingToCart[product._id]}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex justify-center items-center gap-2 shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {addingToCart[product._id] ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Thêm vào giỏ
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
