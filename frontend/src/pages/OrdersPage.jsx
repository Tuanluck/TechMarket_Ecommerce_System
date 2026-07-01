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
  const [statusFilter, setStatusFilter] = useState('all')

  const tabs = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xác nhận', value: 'pending' },
    { label: 'Đang xử lý', value: 'processing' },
    { label: 'Đang giao', value: 'shipped' },
    { label: 'Đã giao', value: 'delivered' },
    { label: 'Đã hủy', value: 'cancelled' }
  ]

  const fetchOrders = async (targetPage = 1, status = 'all') => {
    setLoading(true)
    setError(null)
    try {
      const res = await axiosInstance.get('/orders', {
        params: { page: targetPage, limit: 10, status: status === 'all' ? undefined : status }
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
    fetchOrders(1, statusFilter)
  }, [statusFilter])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    fetchOrders(newPage, statusFilter)
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">Đã thanh toán</span>
      case 'unpaid':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Chưa thanh toán</span>
      case 'refunded':
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">Đã hoàn tiền</span>
      default:
        return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gray-50 text-gray-700 border border-gray-200">{status}</span>
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Đơn hàng của tôi</h1>
          <p className="text-sm text-gray-500">Xem và quản lý các đơn hàng bạn đã mua</p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value)
              setPage(1)
            }}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap -mb-[2px] ${
              statusFilter === tab.value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium max-w-2xl mx-auto my-8">
          ⚠️ {error}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          title="Không tìm thấy đơn hàng"
          message={
            statusFilter === 'all'
              ? 'Lịch sử giao dịch trống. Hãy lựa chọn sản phẩm yêu thích và đặt hàng ngay!'
              : `Bạn không có đơn hàng nào ở trạng thái ${tabs.find((t) => t.value === statusFilter)?.label.toLowerCase()}.`
          }
          icon="📦"
          actionText="Mua sắm ngay"
          actionLink="/"
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-500 text-left">Mã đơn hàng</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-left">Sản phẩm</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-left">Ngày đặt</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-left">Thanh toán</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-left">Tổng tiền</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-left">Trạng thái</th>
                    <th className="px-6 py-4 font-bold text-gray-500 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white font-semibold text-gray-700">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/55 transition-colors">
                      <td className="px-6 py-4 font-bold font-mono text-gray-800 text-xs">{order.orderCode}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 max-w-[280px] overflow-hidden">
                          {order.items && order.items.length > 0 ? (
                            order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0" title={item.productId?.name}>
                                <img
                                  src={item.productId?.thumbnail || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'}
                                  alt={item.productId?.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 font-medium text-xs">Không có sản phẩm</span>
                          )}
                          {order.items && order.items.length > 3 && (
                            <span className="text-xs text-gray-400 font-medium">+{order.items.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-medium text-xs">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">{getPaymentStatusBadge(order.paymentStatus)}</td>
                      <td className="px-6 py-4 text-gray-900 font-extrabold">{formatPrice(order.finalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${getOrderStatusColor(order.orderStatus)}`}>
                          {getOrderStatusLabel(order.orderStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          to={`/orders/${order._id}`}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden divide-y divide-gray-100 p-4 space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-gray-800 text-xs">{order.orderCode}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getOrderStatusColor(order.orderStatus)}`}>
                      {getOrderStatusLabel(order.orderStatus)}
                    </span>
                  </div>
                  {/* Thumbnails row */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        <img
                          src={item.productId?.thumbnail || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'}
                          alt={item.productId?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-gray-400 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>Ngày đặt: {formatDate(order.createdAt)}</span>
                      <span>{getPaymentStatusBadge(order.paymentStatus)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                      <span className="text-gray-400">Tổng thanh toán:</span>
                      <span className="text-gray-800 font-black text-base">{formatPrice(order.finalAmount)}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      to={`/orders/${order._id}`}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-xl w-full text-center"
                    >
                      Xem chi tiết đơn hàng
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
      )}
    </div>
  )
}
