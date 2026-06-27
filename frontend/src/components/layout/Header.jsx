import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Header() {
  const { user, logout, isLoggedIn } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('q') || '')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchKeyword.trim()) {
      navigate(`/?q=${encodeURIComponent(searchKeyword.trim())}`)
    } else {
      navigate('/')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setDropdownOpen(false)
      navigate('/')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-violet-700 transition-all duration-300">
                TechMarket
              </span>
              <span className="text-xl">🛒</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md md:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm điện thoại, laptop, phụ kiện..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Wishlist icon */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl relative transition-all duration-200"
              title="Danh sách yêu thích"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Link>

            {/* Cart icon */}
            <Link
              to="/cart"
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl relative transition-all duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {isLoggedIn && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-gray-100 transition-all duration-200"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {user?.fullName}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    {/* Overlay to close click outside */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-20 transition-all duration-200 transform origin-top-right">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-xs text-gray-400">Tài khoản</p>
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {user?.fullName}
                        </p>
                        {user?.loyaltyPoints !== undefined && (
                          <p className="text-xs text-indigo-600 font-medium mt-0.5">
                            Điểm tích lũy: {user.loyaltyPoints}
                          </p>
                        )}
                      </div>
                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                      >
                        Đơn hàng của tôi
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'staff') && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
                        >
                          Quản trị hệ thống
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 rounded-xl transition-all duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-md rounded-xl transition-all duration-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Sub-Row (Scrollable on mobile) */}
        <div className="flex items-center gap-6 h-10 border-t border-gray-50 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider overflow-x-auto scrollbar-none whitespace-nowrap px-1">
          <Link to="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1 py-2">
            🏠 Trang chủ
          </Link>
          <Link to="/vouchers" className="hover:text-indigo-600 transition-colors flex items-center gap-1 py-2">
            🎟️ Mã giảm giá / Vouchers
          </Link>
          <Link to="/news" className="hover:text-indigo-600 transition-colors flex items-center gap-1 py-2">
            📰 Tin công nghệ
          </Link>
          <Link to="/contact" className="hover:text-indigo-600 transition-colors flex items-center gap-1 py-2">
            📞 Hỗ trợ & Liên hệ
          </Link>
        </div>
      </div>
    </header>
  )
}
