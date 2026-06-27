import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { formatPrice, formatDate, getOrderStatusColor, getOrderStatusLabel } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async (targetPage = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axiosInstance.get('/orders', {
        params: { page: targetPage, limit: 10 }
      })
      const { orders: fetchedOrders, pagination } = res.data.data
      setOrders(fetchedOrders || [])
      setTotalPages(pagination?.totalPages || 1)
      setPage(pagination?.page || 1)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(page)
  }, [])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    fetchOrders(newPage)
  }

  if (loading && orders.length === 0) {
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

  if (orders.length === 0) {
    return (
      <EmptyState
        title="Chưa có đơn hàng nào"
        message="Lịch sử giao dịch trống. Hãy lựa chọn sản phẩm yêu thích và đặt hàng ngay!"
        icon="📦"
        actionText="Mua sắm ngay"
        actionLink="/"
      />
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-800">Đơn hàng của tôi</h1>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 text-left">Mã đơn hàng</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-left">Ngày đặt</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-left">Tổng tiền</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-left">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white font-semibold text-gray-700">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/55 transition-colors">
                  <td className="px-6 py-4 font-bold font-mono text-gray-850">{order.orderCode}</td>
                  <td className="px-6 py-4 text-gray-400 font-medium">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-900 font-extrabold">{formatPrice(order.finalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getOrderStatusColor(order.orderStatus)}`}>
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-gray-150 p-4 space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="pt-4 first:pt-0 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-gray-800 text-sm">{order.orderCode}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getOrderStatusColor(order.orderStatus)}`}>
                  {getOrderStatusLabel(order.orderStatus)}
                </span>
              </div>
              <div className="text-xs font-semibold text-gray-400 flex justify-between">
                <span>Ngày đặt: {formatDate(order.createdAt)}</span>
                <span className="text-gray-800 font-black text-sm">{formatPrice(order.finalAmount)}</span>
              </div>
              <div className="flex justify-end">
                <Link
                  to={`/orders/${order._id}`}
                  className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 bg-gray-50/50 border-t border-gray-100">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              Trước
            </button>
            <span className="text-xs font-bold text-gray-600">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
