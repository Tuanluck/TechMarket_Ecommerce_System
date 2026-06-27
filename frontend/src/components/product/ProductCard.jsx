import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { Heart } from 'lucide-react'

export default function ProductCard({ product }) {
  const { _id, name, slug, thumbnail, basePrice, ratingAvg = 0, stock = 0, brandId } = product
  const brandName = brandId?.name || (typeof brandId === 'string' ? brandId : '')
  const { wishlist, toggleWishlist, isLoggedIn } = useAuth()

  // Support both array of IDs and array of objects
  const isWishlisted = wishlist.some(item => {
    if (typeof item === 'string') return item === _id
    return item?._id === _id
  })

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(_id)
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col h-full relative">
      {/* Out of stock badge */}
      {stock === 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          Hết hàng
        </span>
      )}

      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-all duration-200 border border-gray-100/50 shadow-sm"
        title={isWishlisted ? "Bỏ yêu thích" : "Yêu thích"}
      >
        <Heart
          size={18}
          className={`${isWishlisted ? 'fill-red-500 text-red-500 animate-bounce' : 'text-gray-400'}`}
        />
      </button>

      {/* Product Image */}
      <Link to={`/products/${slug}`} className="block overflow-hidden relative pt-[100%] bg-gray-50">
        <img
          src={thumbnail || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500'}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Brand */}
        {brandName && (
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            {brandName}
          </span>
        )}

        {/* Title */}
        <Link
          to={`/products/${slug}`}
          className="text-sm sm:text-base font-bold text-gray-800 hover:text-indigo-600 transition-colors duration-150 line-clamp-2 min-h-[40px] mb-2"
        >
          {name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-400 text-sm">⭐</span>
          <span className="text-xs font-bold text-gray-600">
            {ratingAvg ? ratingAvg.toFixed(1) : '5.0'}
          </span>
        </div>

        {/* Price and Action */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-black text-gray-900">
            {formatPrice(basePrice)}
          </span>
          <Link
            to={`/products/${slug}`}
            className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg transition-colors duration-150"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  )
}
