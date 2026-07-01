import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ProductCard from './ProductCard';
import LoadingSpinner from '../common/LoadingSpinner';

export default function RelatedProducts({ categoryId, excludeProductId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    const fetchRelated = async () => {
      try {
        const res = await axiosInstance.get('/products', {
          params: { categoryId, limit: 5 }
        });
        if (res.data.success && res.data.data?.products) {
          // Filter out the current product
          const filtered = res.data.data.products.filter(
            (p) => p._id !== excludeProductId
          );
          setProducts(filtered.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [categoryId, excludeProductId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
        <span>🔥</span> Sản phẩm liên quan bạn có thể thích
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
