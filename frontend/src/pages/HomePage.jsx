import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import ProductGrid from '../components/product/ProductGrid'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import FlashSaleBanner from '../components/home/FlashSaleBanner'
import PromoCarousel from '../components/home/PromoCarousel'

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // State for products and pagination
  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  
  // State for active flash sale to toggle layout
  const [activeFlashSale, setActiveFlashSale] = useState(null)
  const [hasCheckedFlashSale, setHasCheckedFlashSale] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for filter options
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  // Local filter states (prefilled from searchParams)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'newest')

  // Fetch categories & brands once on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axiosInstance.get('/categories'),
          axiosInstance.get('/brands')
        ])
        setCategories(catRes.data.data || [])
        setBrands(brandRes.data.data || [])
      } catch (err) {
        console.error('Lỗi khi tải danh mục/thương hiệu:', err)
      }
    }
    fetchMetadata()
  }, [])

  // Fetch active flash sale to determine layout
  useEffect(() => {
    const checkFlashSale = async () => {
      try {
        const res = await axiosInstance.get('/flash-sales/active')
        if (res.data.success && res.data.data) {
          setActiveFlashSale(res.data.data)
        } else {
          setActiveFlashSale(null)
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin flash sale:', err)
        setActiveFlashSale(null)
      } finally {
        setHasCheckedFlashSale(true)
      }
    }
    checkFlashSale()
  }, [])

  // Sync URL searchParams to local filter states
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '')
    setSelectedBrand(searchParams.get('brand') || '')
    setMinPrice(searchParams.get('minPrice') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
    setSortOrder(searchParams.get('sort') || 'newest')
  }, [searchParams])

  // Fetch products whenever searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {}
        const page = searchParams.get('page') || '1'
        const q = searchParams.get('q') || ''
        const category = searchParams.get('category') || ''
        const brand = searchParams.get('brand') || ''
        const minP = searchParams.get('minPrice') || ''
        const maxP = searchParams.get('maxPrice') || ''
        const sort = searchParams.get('sort') || 'newest'

        params.page = page
        params.limit = 12
        if (q) params.q = q
        if (category) params.category = category
        if (brand) params.brand = brand
        if (minP) params.minPrice = minP
        if (maxP) params.maxPrice = maxP
        if (sort) params.sort = sort

        const res = await axiosInstance.get('/products', { params })
        const { products: fetchedProducts, pagination } = res.data.data
        setProducts(fetchedProducts || [])
        setTotalPages(pagination?.totalPages || 1)
        setTotalProducts(pagination?.total || 0)
      } catch (err) {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải sản phẩm.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchParams])

  // Helper to apply filters to search params
  const applyFilters = (newParamsObj = {}) => {
    const currentParams = {}
    
    // Maintain search query if any
    const q = searchParams.get('q')
    if (q) currentParams.q = q

    // Merge other parameters
    const category = newParamsObj.category !== undefined ? newParamsObj.category : selectedCategory
    const brand = newParamsObj.brand !== undefined ? newParamsObj.brand : selectedBrand
    const minP = newParamsObj.minPrice !== undefined ? newParamsObj.minPrice : minPrice
    const maxP = newParamsObj.maxPrice !== undefined ? newParamsObj.maxPrice : maxPrice
    const sort = newParamsObj.sort !== undefined ? newParamsObj.sort : sortOrder
    const page = newParamsObj.page !== undefined ? newParamsObj.page : '1' // reset page to 1 on filter change

    if (category) currentParams.category = category
    if (brand) currentParams.brand = brand
    if (minP) currentParams.minPrice = minP
    if (maxP) currentParams.maxPrice = maxP
    if (sort) currentParams.sort = sort
    if (page && page !== '1') currentParams.page = page

    setSearchParams(currentParams)
  }

  const handleResetFilters = () => {
    setSelectedCategory('')
    setSelectedBrand('')
    setMinPrice('')
    setMaxPrice('')
    setSortOrder('newest')
    
    const currentParams = {}
    const q = searchParams.get('q')
    if (q) currentParams.q = q
    setSearchParams(currentParams)
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    applyFilters({ page: String(newPage) })
  }

  const currentPage = parseInt(searchParams.get('page') || '1')
  const searchQuery = searchParams.get('q') || ''

  return (
    <div className="space-y-8 bg-gray-50/20">
      {/* Top Hero Section: Promo Carousel + Compact Autoplaying Flash Sale */}
      {!searchQuery && hasCheckedFlashSale && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className={activeFlashSale ? "lg:col-span-2" : "lg:col-span-3"}>
            <PromoCarousel />
          </div>
          {activeFlashSale && (
            <div className="lg:col-span-1">
              <FlashSaleBanner flashSaleData={activeFlashSale} />
            </div>
          )}
        </div>
      )}

      {/* Search Header Banner */}
      {searchQuery && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Kết quả tìm kiếm cho &ldquo;<span className="text-indigo-600 font-extrabold">{searchQuery}</span>&rdquo;
            </h2>
            <p className="text-sm text-gray-500 mt-1">Tìm thấy {totalProducts} sản phẩm</p>
          </div>
          <button
            onClick={() => {
              const currentParams = {}
              searchParams.forEach((val, key) => {
                if (key !== 'q') currentParams[key] = val
              })
              setSearchParams(currentParams)
            }}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 self-start md:self-auto transition-all"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>🎛️</span> Bộ lọc tìm kiếm
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors"
            >
              Thiết lập lại
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Danh mục
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                applyFilters({ category: e.target.value })
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Thương hiệu
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value)
                applyFilters({ brand: e.target.value })
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Khoảng giá (VND)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <button
              onClick={() => applyFilters()}
              className="w-full mt-2 py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all duration-200"
            >
              Áp dụng giá
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Sắp xếp theo
            </label>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value)
                applyFilters({ sort: e.target.value })
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Panel */}
        <section className="flex-1 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 font-medium">
              ⚠️ {error}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              message="Thử thay đổi bộ lọc tìm kiếm hoặc từ khóa để tìm thấy kết quả phù hợp hơn."
              icon="🔎"
            />
          ) : (
            <>
              {/* Product list */}
              <ProductGrid products={products} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-gray-100">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm font-bold text-gray-600 px-4">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
