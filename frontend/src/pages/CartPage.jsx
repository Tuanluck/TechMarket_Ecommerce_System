import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

export default function CartPage() {
  const navigate = useNavigate()
  const { fetchCart, cartCount } = useCart()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch full cart data with item populated details
  const getCartDetails = async () => {
    try {
      const res = await axiosInstance.get('/cart')
      setCartItems(res.data.data?.items || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin giỏ hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCartDetails()
  }, [])

  // Helper to get actual price of the item (looks up variant price if applicable)
  const getItemPrice = (item) => {
    const product = item.productId
    if (!product) return 0
    if (item.variantName && product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.color === item.variantName)
      if (variant) return variant.price
    }
    return product.basePrice
  }

  // Calculate client-side subtotal based on correct variant prices
  const subtotal = cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)

  const handleUpdateQuantity = async (itemId, newQty, stockLimit) => {
    if (newQty < 1) return
    if (newQty > stockLimit) {
      alert(`Số lượng vượt quá hàng tồn kho khả dụng (${stockLimit}).`)
      return
    }

    try {
      setLoading(true)
      await axiosInstance.patch(`/cart/items/${itemId}`, { quantity: newQty })
      await getCartDetails()
      await fetchCart() // Update header cart count
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật số lượng thất bại.')
      setLoading(false)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return
    try {
      setLoading(true)
      await axiosInstance.delete(`/cart/items/${itemId}`)
      await getCartDetails()
      await fetchCart() // Update header cart count
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa sản phẩm thất bại.')
      setLoading(false)
    }
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium max-w-2xl mx-auto my-8">
        ⚠️ {error}
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <EmptyState
        title="Giỏ hàng trống"
        message="Giỏ hàng của bạn đang trống. Hãy thêm các sản phẩm công nghệ mới nhất vào giỏ để tiếp tục!"
        icon="🛒"
        actionText="Tiếp tục mua sắm"
        actionLink="/"
      />
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-800">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = item.productId
            if (!product) return null
            
            // Get correct stock limit based on selected variant
            let stockLimit = product.stock
            if (item.variantName && product.variants && product.variants.length > 0) {
              const variant = product.variants.find(v => v.color === item.variantName)
              if (variant) stockLimit = variant.stock
            }

            const itemUnitPrice = getItemPrice(item)

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Product image */}
                <Link
                  to={`/products/${product.slug}`}
                  className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50"
                >
                  <img
                    src={product.thumbnail || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product.slug}`}
                    className="font-bold text-gray-800 hover:text-indigo-600 truncate block text-sm sm:text-base"
                  >
                    {product.name}
                  </Link>
                  {item.variantName && (
                    <span className="inline-block mt-1 text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                      Màu: {item.variantName}
                    </span>
                  )}
                  <div className="text-sm font-bold text-indigo-600 mt-2 sm:hidden">
                    {formatPrice(itemUnitPrice)}
                  </div>
                </div>

                {/* Quantity Controls & Total price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity - 1, stockLimit)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-sm font-bold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item._id, item.quantity + 1, stockLimit)}
                      disabled={item.quantity >= stockLimit}
                      className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {/* Desktop item price & total */}
                  <div className="text-right hidden sm:block min-w-[120px]">
                    <p className="text-sm text-gray-400 font-medium">Đơn giá: {formatPrice(itemUnitPrice)}</p>
                    <p className="text-base font-black text-gray-800 mt-0.5">
                      {formatPrice(itemUnitPrice * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa sản phẩm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Checkout summary card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-bold text-gray-800 pb-3 border-b border-gray-50">Tóm tắt đơn hàng</h2>
          <div className="space-y-4 text-sm font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Số lượng mặt hàng:</span>
              <span className="text-gray-800">{cartCount} sản phẩm</span>
            </div>
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="text-gray-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="text-green-600">Miễn phí</span>
            </div>
            <div className="border-t border-gray-50 pt-4 flex justify-between items-end">
              <span className="text-gray-800 font-bold">Tổng thanh toán:</span>
              <span className="text-2xl font-black text-indigo-600">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-center shadow-lg shadow-indigo-100 transition-all duration-200"
          >
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  )
}
