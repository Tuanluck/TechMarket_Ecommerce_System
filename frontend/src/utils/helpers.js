// Format giá tiền VND
export const formatPrice = (price) => {
  if (price === undefined || price === null) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

// Format ngày giờ
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Màu badge trạng thái đơn hàng
export const getOrderStatusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border border-blue-200',
    shipped: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    delivered: 'bg-green-100 text-green-800 border border-green-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200',
  }
  return map[status] || 'bg-gray-100 text-gray-800 border border-gray-200'
}

// Tên trạng thái tiếng Việt
export const getOrderStatusLabel = (status) => {
  const map = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  }
  return map[status] || status
}
