import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Modal, Rate, Input } from 'antd'
import toast from 'react-hot-toast'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  // Review states
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewedProductIds, setReviewedProductIds] = useState([])

  const fetchOrderDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axiosInstance.get(`/orders/${id}`)
      setOrderData(res.data.data)
      
      // Load reviewed IDs from localStorage
      const saved = localStorage.getItem(`reviewed_${res.data.data.order._id}`)
      if (saved) {
        setReviewedProductIds(JSON.parse(saved))
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lấy thông tin chi tiết đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Chi tiết đơn hàng - TechMarket';
    if (id) {
      fetchOrderDetails()
    }
  }, [id])

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return

    setCancelLoading(true)
    try {
      await axiosInstance.patch(`/orders/${id}/cancel`)
      toast.success('Đơn hàng đã được hủy thành công.')
      await fetchOrderDetails() // Reload data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hủy đơn hàng thất bại.')
    } finally {
      setCancelLoading(false)
    }
  }

  const handlePayAgain = async () => {
    if (!orderData?.order) return
    setPayLoading(true)
    try {
      const res = await axiosInstance.post('/payments/create-vnpay', {
        orderId: orderData.order._id
      })
      if (res.data.success && res.data.data?.paymentUrl) {
        toast.loading('Đang chuyển hướng sang VNPay...')
        window.location.href = res.data.data.paymentUrl
      } else {
        toast.error('Không thể tạo URL thanh toán VNPay.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể kết nối cổng thanh toán.')
    } finally {
      setPayLoading(false)
    }
  }

  const handleOpenReviewModal = (product) => {
    setSelectedProduct(product)
    setRating(5)
    setComment('')
    setReviewModalVisible(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedProduct) return
    setSubmittingReview(true)
    try {
      await axiosInstance.post('/reviews', {
        productId: selectedProduct._id,
        orderId: orderData.order._id,
        rating,
        comment,
      })
      toast.success('Đã gửi đánh giá sản phẩm thành công!')
      
      const newReviewedIds = [...reviewedProductIds, selectedProduct._id]
      setReviewedProductIds(newReviewedIds)
      localStorage.setItem(`reviewed_${orderData.order._id}`, JSON.stringify(newReviewedIds))
      
      setReviewModalVisible(false)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const getTimelineSteps = (status) => {
    const steps = [
      { key: 'pending', label: 'Đặt hàng thành công', desc: 'Đơn hàng mới đã được khởi tạo' },
      { key: 'processing', label: 'Đã xác nhận', desc: 'Đơn hàng đang được chuẩn bị' },
      { key: 'shipped', label: 'Đang vận chuyển', desc: 'Đơn hàng đã được bàn giao đối tác vận chuyển' },
      { key: 'delivered', label: 'Giao hàng thành công', desc: 'Giao hàng thành công' }
    ]

    if (status === 'cancelled') {
      return (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
          <span className="text-xl">❌</span>
          <div>
            <p className="font-bold">Đơn hàng này đã bị hủy</p>
            <p className="text-xs text-red-500">Các sản phẩm và ưu đãi đã được hoàn trả.</p>
          </div>
        </div>
      )
    }

    const currentIdx = steps.findIndex(s => s.key === status)

    return (
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 text-base mb-6 pb-2 border-b border-gray-55 flex items-center gap-2">
          <span>🚚</span> Hành trình đơn hàng
        </h3>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4">
          <div className="absolute top-[18px] left-6 right-6 h-0.5 bg-gray-100 hidden md:block z-0" />
          
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx
            const isCurrent = idx === currentIdx
            return (
              <div key={step.key} className="flex md:flex-col items-start md:items-center md:text-center gap-4 md:gap-3 flex-1 z-10 relative">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-300 border-2 border-gray-250'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="text-left md:text-center">
                  <p className={`text-sm font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium leading-normal mt-0.5 max-w-[160px]">
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading && !orderData) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium max-w-2xl mx-auto my-8">
        ⚠️ {error || 'Không tìm thấy thông tin đơn hàng.'}
      </div>
    )
  }

  const { order, items } = orderData
  const address = order.shippingAddress || {}
  const fullAddress = `${address.detailAddress}, ${address.ward}, ${address.district}, ${address.province}`

  const isVnpayUnpaid = order.paymentMethod === 'vnpay' && order.paymentStatus === 'unpaid' && order.orderStatus === 'pending'

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2 pb-12">
      {/* Header breadcrumb & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/orders" className="text-xs font-bold text-indigo-600 hover:underline">
            ← Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-800 mt-2 flex items-center gap-2">
            Chi tiết đơn hàng: <span className="font-mono text-gray-900">{order.orderCode}</span>
          </h1>
        </div>

        <div className="flex gap-2">
          {isVnpayUnpaid && (
            <button
              onClick={handlePayAgain}
              disabled={payLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-indigo-100"
            >
              {payLoading ? 'Đang khởi tạo...' : 'Thanh toán lại qua VNPay'}
            </button>
          )}

          {order.orderStatus === 'pending' && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelLoading}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {cancelLoading ? 'Đang hủy đơn...' : 'Hủy đơn hàng'}
            </button>
          )}
        </div>
      </div>

      {/* Journey steps tracker */}
      {getTimelineSteps(order.orderStatus)}

      {/* Grid of info boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Box 1: Order Metadata */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3 font-semibold text-sm text-gray-500">
          <h3 className="text-gray-800 font-bold text-base border-b border-gray-50 pb-2">Thông tin đơn</h3>
          <div className="flex justify-between">
            <span>Ngày đặt:</span>
            <span className="text-gray-800">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phương thức:</span>
            <span className="text-gray-800 uppercase">{order.paymentMethod === 'cod' ? 'Thanh toán COD' : order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Thanh toán:</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span>Trạng thái:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getOrderStatusColor(order.orderStatus)}`}>
              {getOrderStatusLabel(order.orderStatus)}
            </span>
          </div>
        </div>

        {/* Box 2 & 3: Shipping Address */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-gray-800 font-bold text-base border-b border-gray-50 pb-2">Địa chỉ giao hàng</h3>
          <div className="text-sm font-semibold space-y-1">
            <p className="text-gray-800 font-bold text-base">{address.fullName}</p>
            <p className="text-gray-500 font-bold">SĐT: <span className="text-gray-800 font-mono">{address.phone}</span></p>
            <p className="text-gray-500 mt-2 leading-relaxed">Địa chỉ chi tiết: <span className="text-gray-800">{fullAddress}</span></p>
          </div>
        </div>
      </div>

      {/* Products list card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">Danh sách sản phẩm</h3>
        </div>
        
        <div className="divide-y divide-gray-100 px-6">
          {items.map((item) => {
            const product = item.productId
            const hasReviewed = reviewedProductIds.includes(product?._id)
            return (
              <div key={item._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Product Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-50 flex-shrink-0">
                    <img
                      src={product?.thumbnail || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150'}
                      alt={product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    {product ? (
                      <Link
                        to={`/products/${product.slug}`}
                        className="font-bold text-gray-800 hover:text-indigo-600 truncate block text-sm sm:text-base"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <span className="font-bold text-gray-400 text-sm sm:text-base">Sản phẩm đã dừng kinh doanh</span>
                    )}
                    {item.variantName && (
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        Phiên bản: {item.variantName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtotals & quantities */}
                <div className="flex items-center justify-between sm:justify-end gap-6 font-semibold text-sm">
                  <div className="text-right sm:text-left text-gray-400">
                    <span>{formatPrice(item.priceAtBuy)}</span>
                    <span className="mx-2">x</span>
                    <span className="text-gray-700 font-bold">{item.quantity}</span>
                  </div>
                  <div className="text-right font-black text-gray-800 min-w-[100px]">
                    {formatPrice(item.priceAtBuy * item.quantity)}
                  </div>
                  
                  {/* Review Action */}
                  {order.orderStatus === 'delivered' && product && (
                    <div className="min-w-[120px] text-right">
                      {hasReviewed ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">Đã đánh giá</span>
                      ) : (
                        <button
                          onClick={() => handleOpenReviewModal(product)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Đánh giá sản phẩm
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Totals Summary */}
        <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex justify-end">
          <div className="w-full sm:w-80 space-y-3 text-sm font-semibold text-gray-500">
            <div className="flex justify-between">
              <span>Cộng tiền hàng:</span>
              <span className="text-gray-800">{formatPrice(order.totalAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Mã giảm giá:</span>
                <span>- {formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="text-green-600">Miễn phí</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
              <span className="text-gray-800 font-bold text-base">Tổng thanh toán:</span>
              <span className="text-xl font-black text-indigo-600">{formatPrice(order.finalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        title={<span className="font-bold text-gray-800">Đánh giá sản phẩm</span>}
        open={reviewModalVisible}
        onOk={handleSubmitReview}
        onCancel={() => setReviewModalVisible(false)}
        confirmLoading={submittingReview}
        okText="Gửi đánh giá"
        cancelText="Hủy"
        okButtonProps={{ className: 'bg-indigo-600 hover:bg-indigo-700 text-white border-none' }}
      >
        {selectedProduct && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <img src={selectedProduct.thumbnail} className="w-12 h-12 object-cover rounded border" />
              <span className="font-bold text-gray-700 text-sm">{selectedProduct.name}</span>
            </div>
            <div>
              <span className="block text-sm font-semibold text-gray-500 mb-1">Chọn mức đánh giá:</span>
              <Rate value={rating} onChange={(val) => setRating(val)} />
            </div>
            <div>
              <span className="block text-sm font-semibold text-gray-500 mb-1">Nội dung đánh giá:</span>
              <Input.TextArea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập cảm nhận của bạn về sản phẩm này..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
