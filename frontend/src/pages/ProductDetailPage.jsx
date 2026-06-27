import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatPrice, formatDate } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Rate } from 'antd'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { fetchCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Product interaction states
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState('')
  
  // UI states
  const [addCartLoading, setAddCartLoading] = useState(false)

  // Reviews states
  const [reviews, setReviews] = useState([])
  const [reviewTotal, setReviewTotal] = useState(0)
  const [reviewPage, setReviewPage] = useState(1)
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axiosInstance.get(`/products/${slug}`)
        const data = res.data.data
        setProduct(data)
        
        // Set default active image
        setActiveImage(data.thumbnail || '')

        // Set default variant if available
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0])
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải chi tiết sản phẩm.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProductDetails()
    }
  }, [slug])

  // Fetch reviews when product details are loaded
  useEffect(() => {
    if (!product?._id) return
    const fetchReviews = async () => {
      setLoadingReviews(true)
      try {
        const res = await axiosInstance.get(`/reviews/product/${product._id}`, {
          params: { page: reviewPage, limit: 5 }
        })
        if (res.data.success) {
          setReviews(res.data.data.reviews || [])
          setReviewTotal(res.data.data.total || 0)
        }
      } catch (err) {
        console.error('Error fetching reviews:', err)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [product?._id, reviewPage])

  useEffect(() => {
    if (product) {
      document.title = `${product.name} - TechMarket`;
    }
  }, [product]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium max-w-2xl mx-auto my-8">
        ⚠️ {error || 'Không tìm thấy sản phẩm.'}
      </div>
    )
  }

  // Get current price & stock based on selected variant
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const brandName = product.brandId?.name || (typeof product.brandId === 'string' ? product.brandId : '')

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    setAddCartLoading(true)

    try {
      const payload = {
        productId: product._id,
        quantity: quantity,
      }
      if (selectedVariant) {
        payload.variantName = selectedVariant.color
      }

      await axiosInstance.post('/cart/items', payload)
      await fetchCart() // Refresh cart header count
      toast.success('Đã thêm sản phẩm vào giỏ hàng thành công! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ.')
    } finally {
      setAddCartLoading(false)
    }
  }

  const handleQtyChange = (val) => {
    const num = parseInt(val)
    if (isNaN(num) || num < 1) {
      setQuantity(1)
    } else if (num > currentStock) {
      setQuantity(currentStock)
    } else {
      setQuantity(num)
    }
  }

  const allImages = [product.thumbnail, ...(product.images || [])].filter(Boolean)

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Detail card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden relative shadow-inner">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800'}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImage === img ? 'border-indigo-600 shadow-sm' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`${product.name} - ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Interaction details */}
        <div className="flex flex-col space-y-6">
          <div>
            {brandName && (
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase rounded-lg tracking-wider mb-2">
                {brandName}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>
            
            {/* Rating & Stock status */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg">⭐</span>
                <span className="text-sm font-bold text-gray-700">
                  {product.ratingAvg ? product.ratingAvg.toFixed(1) : '5.0'} / 5.0
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <span className={`text-sm font-semibold ${currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {currentStock > 0 ? `Còn hàng (${currentStock} sản phẩm)` : 'Tạm hết hàng'}
              </span>
            </div>
          </div>

          {/* Pricing display */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Giá bán lẻ đề xuất</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{formatPrice(currentPrice)}</p>
          </div>

          {/* Variant Picker */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 block">Chọn phiên bản màu:</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedVariant(variant)
                      if (quantity > variant.stock) setQuantity(variant.stock || 1)
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      selectedVariant?.color === variant.color
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {variant.color} - {variant.specs} ({formatPrice(variant.price)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector & Add to Cart button */}
          {currentStock > 0 ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-700">Số lượng:</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => handleQtyChange(quantity - 1)}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={currentStock}
                    value={quantity}
                    onChange={(e) => handleQtyChange(e.target.value)}
                    className="w-12 text-center text-sm font-semibold text-gray-800 border-none outline-none focus:ring-0 p-0"
                  />
                  <button
                    onClick={() => handleQtyChange(quantity + 1)}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addCartLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {addCartLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <span>🛒</span> Thêm vào giỏ hàng
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                disabled
                className="w-full py-4 bg-gray-150 text-gray-400 font-bold rounded-2xl cursor-not-allowed border border-gray-100"
              >
                Hết hàng tạm thời
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Specifications Table */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span>⚙️</span> Thông số kỹ thuật chi tiết
          </h2>
          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <tbody className="divide-y divide-gray-100 bg-white">
                {Object.entries(product.specs).map(([key, value], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 font-bold text-gray-500 w-1/3 border-r border-gray-100">
                      {key}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>💬</span> Đánh giá từ khách hàng ({reviewTotal})
          </h2>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-base">⭐</span>
            <span className="text-sm font-bold text-gray-800">
              {product.ratingAvg ? product.ratingAvg.toFixed(1) : '5.0'}/5
            </span>
          </div>
        </div>

        {loadingReviews ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Sản phẩm này chưa có đánh giá nào.</p>
        ) : (
          <div className="space-y-6 divide-y divide-gray-50">
            {reviews.map((r) => (
              <div key={r._id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                      {r.userId?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{r.userId?.fullName || 'Khách hàng'}</h4>
                      <p className="text-[10px] text-gray-400">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <Rate disabled defaultValue={r.rating} style={{ fontSize: 13 }} />
                </div>
                <p className="text-sm text-gray-650 mt-2 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  {r.comment || 'Khách hàng không để lại bình luận.'}
                </p>
              </div>
            ))}

            {/* Reviews Pagination */}
            {reviewTotal > 5 && (
              <div className="flex justify-center items-center gap-3 pt-6">
                <button
                  disabled={reviewPage === 1}
                  onClick={() => setReviewPage(reviewPage - 1)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40"
                >
                  Trước
                </button>
                <span className="text-xs font-bold text-gray-600">Trang {reviewPage}</span>
                <button
                  disabled={reviewPage * 5 >= reviewTotal}
                  onClick={() => setReviewPage(reviewPage + 1)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
