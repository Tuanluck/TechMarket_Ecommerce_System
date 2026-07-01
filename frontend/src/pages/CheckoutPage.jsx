import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/helpers'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchCart } = useCart()

  // Cart summary states
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Address form states
  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    province: '',
    district: '',
    ward: '',
    detailAddress: ''
  })
  
  const [formErrors, setFormErrors] = useState({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('')
  const [checkingVoucher, setCheckingVoucher] = useState(false)
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [voucherError, setVoucherError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  useEffect(() => {
    document.title = 'Thanh toán đơn hàng - TechMarket';
    const fetchCartDetails = async () => {
      try {
        const res = await axiosInstance.get('/cart')
        const items = res.data.data?.items || []
        setCartItems(items)
        if (items.length === 0) {
          navigate('/cart') // Redirect if cart is empty
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin thanh toán.')
      } finally {
        setLoading(false)
      }
    }
    fetchCartDetails()
  }, [navigate])

  const getItemPrice = (item) => {
    const product = item.productId
    if (!product) return 0
    if (item.variantName && product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.color === item.variantName)
      if (variant) return variant.price
    }
    return product.basePrice
  }

  const subtotal = cartItems.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
  const finalAmount = Math.max(0, subtotal - discountAmount)

  const validateForm = () => {
    const errors = {}
    if (!address.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên người nhận.'
    if (!address.phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.'
    if (!address.province.trim()) errors.province = 'Vui lòng nhập Tỉnh/Thành phố.'
    if (!address.district.trim()) errors.district = 'Vui lòng nhập Quận/Huyện.'
    if (!address.ward.trim()) errors.ward = 'Vui lòng nhập Phường/Xã.'
    if (!address.detailAddress.trim()) errors.detailAddress = 'Vui lòng nhập số nhà, tên đường cụ thể.'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return
    setCheckingVoucher(true)
    setVoucherError('')
    try {
      const res = await axiosInstance.post('/vouchers/validate', {
        code: voucherCode.trim(),
        orderAmount: subtotal
      })
      if (res.data.data) {
        setAppliedVoucher(res.data.data.voucher)
        setDiscountAmount(res.data.data.discountAmount)
        toast.success('Áp dụng mã giảm giá thành công!')
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || 'Mã giảm giá không hợp lệ'
      setVoucherError(msg)
      toast.error(msg)
    } finally {
      setCheckingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setDiscountAmount(0)
    setVoucherCode('')
    setVoucherError('')
    toast.success('Đã hủy áp dụng mã giảm giá')
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) return

    setSubmitLoading(true)
    try {
      const payload = {
        shippingAddress: address,
        paymentMethod: paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined
      }

      const res = await axiosInstance.post('/orders', payload)
      const order = res.data.data

      // Successfully ordered! Clear cart badge
      await fetchCart()

      if (paymentMethod === 'vnpay') {
        const loadToast = toast.loading('Đang chuyển hướng đến cổng thanh toán VNPay...')
        try {
          const paymentRes = await axiosInstance.post('/payments/create-vnpay', { orderId: order._id })
          const paymentUrl = paymentRes.data.data?.paymentUrl
          toast.dismiss(loadToast)
          if (paymentUrl) {
            window.location.href = paymentUrl
          } else {
            toast.error('Không tạo được liên kết thanh toán!')
            navigate(`/orders/${order._id}`)
          }
        } catch (paymentErr) {
          toast.dismiss(loadToast)
          toast.error('Có lỗi xảy ra khi tạo giao dịch thanh toán!')
          navigate(`/orders/${order._id}`)
        }
      } else {
        toast.success('Đặt hàng thành công!')
        navigate(`/order-success/${order._id}`)
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại giỏ hàng.')
      toast.error('Đặt hàng thất bại!')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold text-gray-800">Thanh toán đơn hàng</h1>

      {submitError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
          ⚠️ {submitError}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Shipping Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 pb-3 border-b border-gray-50">Địa chỉ giao hàng</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên người nhận *</label>
              <input
                type="text"
                value={address.fullName}
                onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                className={`w-full bg-gray-50 border ${formErrors.fullName ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500`}
                placeholder="Nguyễn Văn A"
              />
              {formErrors.fullName && <p className="text-xs text-red-500 mt-1 font-semibold">{formErrors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className={`w-full bg-gray-50 border ${formErrors.phone ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500`}
                placeholder="09xxxxxxxx"
              />
              {formErrors.phone && <p className="text-xs text-red-500 mt-1 font-semibold">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tỉnh / Thành phố *</label>
              <input
                type="text"
                value={address.province}
                onChange={(e) => setAddress({ ...address, province: e.target.value })}
                className={`w-full bg-gray-50 border ${formErrors.province ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500`}
                placeholder="Hà Nội / TP.HCM"
              />
              {formErrors.province && <p className="text-xs text-red-500 mt-1 font-semibold">{formErrors.province}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quận / Huyện *</label>
              <input
                type="text"
                value={address.district}
                onChange={(e) => setAddress({ ...address, district: e.target.value })}
                className={`w-full bg-gray-50 border ${formErrors.district ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500`}
                placeholder="Quận Cầu Giấy / Quận 1"
              />
              {formErrors.district && <p className="text-xs text-red-500 mt-1 font-semibold">{formErrors.district}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phường / Xã *</label>
              <input
                type="text"
                value={address.ward}
                onChange={(e) => setAddress({ ...address, ward: e.target.value })}
                className={`w-full bg-gray-50 border ${formErrors.ward ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500`}
                placeholder="Phường Dịch Vọng / Phường Bến Nghé"
              />
              {formErrors.ward && <p className="text-xs text-red-500 mt-1 font-semibold">{formErrors.ward}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ chi tiết *</label>
              <input
                type="text"
                value={address.detailAddress}
                onChange={(e) => setAddress({ ...address, detailAddress: e.target.value })}
                className={`w-full bg-gray-50 border ${formErrors.detailAddress ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500`}
                placeholder="Số nhà, ngõ ngách, tên đường..."
              />
              {formErrors.detailAddress && <p className="text-xs text-red-500 mt-1 font-semibold">{formErrors.detailAddress}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50 space-y-4">
            <h3 className="font-bold text-gray-800 text-base">Phương thức thanh toán</h3>
            <div className="space-y-3">
              {/* COD */}
              <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-150 bg-gray-50/50'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod"
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')} 
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500" 
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-xs text-gray-500">Thanh toán bằng tiền mặt khi shipper giao hàng.</p>
                </div>
              </label>

              {/* VNPay */}
              <label className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-150 bg-gray-50/50'}`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'} 
                    onChange={() => setPaymentMethod('vnpay')} 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500" 
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-805">Thanh toán qua ví VNPay</p>
                    <p className="text-xs text-gray-500">Kết nối thẻ ngân hàng hoặc quét mã QR.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase">Nhanh</span>
              </label>

              {/* MoMo */}
              <div className="flex items-center justify-between p-4 border border-gray-150 bg-gray-50/50 rounded-2xl opacity-60">
                <div className="flex items-center gap-3">
                  <input type="radio" disabled className="h-4 w-4 text-gray-300 cursor-not-allowed" />
                  <div>
                    <p className="text-sm font-bold text-gray-600">Thanh toán qua Ví MoMo</p>
                    <p className="text-xs text-gray-400">Nhanh chóng, tiện lợi bằng ví MoMo.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">Sắp có</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-bold text-gray-800 pb-3 border-b border-gray-50">Tóm tắt đơn hàng</h2>
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 pr-1">
            {cartItems.map((item) => (
              <div key={item._id} className="py-3 flex items-center gap-3">
                <img
                  src={item.productId?.thumbnail || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100'}
                  alt={item.productId?.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-50"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-850 truncate">{item.productId?.name}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    {item.variantName ? `Màu: ${item.variantName} | ` : ''}SL: {item.quantity}
                  </p>
                </div>
                <p className="text-xs font-black text-gray-800">
                  {formatPrice(getItemPrice(item) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          {/* Voucher Section */}
          <div className="border-t border-b border-gray-50 py-4 my-2 space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Mã giảm giá (Voucher)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã voucher"
                disabled={!!appliedVoucher}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 uppercase font-mono font-bold"
              />
              {appliedVoucher ? (
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-650 text-xs font-bold rounded-xl border border-red-200 transition-all cursor-pointer"
                >
                  Hủy
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={!voucherCode.trim() || checkingVoucher}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {checkingVoucher ? '...' : 'Áp dụng'}
                </button>
              )}
            </div>
            {voucherError && <p className="text-[11px] text-red-500 font-semibold">{voucherError}</p>}
            {appliedVoucher && (
              <p className="text-[11px] text-green-600 font-semibold">
                Đã áp dụng mã {appliedVoucher.code}! (Giảm {appliedVoucher.discountType === 'percent' ? `${appliedVoucher.discountValue}%` : `${appliedVoucher.discountValue.toLocaleString()}đ`})
              </p>
            )}
          </div>

          <div className="border-t border-gray-50 pt-4 space-y-3 text-sm font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="text-gray-800">{formatPrice(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá voucher:</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="text-green-600">Miễn phí</span>
            </div>
            <div className="border-t border-gray-50 pt-4 flex justify-between items-end">
              <span className="text-gray-800 font-bold">Tổng thanh toán:</span>
              <span className="text-xl font-black text-indigo-600">{formatPrice(finalAmount)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-center shadow-lg shadow-indigo-100 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Đang xử lý đặt hàng...</span>
              </>
            ) : (
              'Đặt hàng ngay'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
