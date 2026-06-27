import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { formatPrice } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function OrderSuccessPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${orderId}`)
        setOrder(res.data.data?.order || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng vừa đặt.')
      } finally {
        setLoading(false)
      }
    }
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium max-w-2xl mx-auto my-8">
        ⚠️ {error || 'Không tìm thấy thông tin đơn hàng.'}
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4">
      {/* Success animation wrapper */}
      <div className="flex flex-col items-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl shadow-sm border border-green-100 animate-bounce">
          ✓
        </div>
        
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Đặt hàng thành công!</h1>
          <p className="text-gray-400 text-sm mt-1">Cảm ơn bạn đã tin tưởng mua sắm tại TechMarket.</p>
        </div>

        {/* Invoice Summary */}
        <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm space-y-3 font-semibold text-gray-500 text-left">
          <div className="flex justify-between">
            <span>Mã đơn hàng:</span>
            <span className="text-gray-800 font-bold font-mono">{order.orderCode}</span>
          </div>
          <div className="flex justify-between">
            <span>Phương thức thanh toán:</span>
            <span className="text-gray-800 uppercase">{order.paymentMethod === 'cod' ? 'Thanh toán COD' : order.paymentMethod}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 items-end">
            <span className="text-gray-800 font-bold">Tổng thanh toán:</span>
            <span className="text-lg font-black text-indigo-600">{formatPrice(order.finalAmount)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-2.5">
          <Link
            to={`/orders/${order._id}`}
            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center shadow-md shadow-indigo-100 transition-all"
          >
            Xem chi tiết đơn hàng
          </Link>
          <Link
            to="/"
            className="block w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-center transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}
