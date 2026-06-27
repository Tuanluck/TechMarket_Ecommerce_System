import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState([])

  const fetchWishlist = async () => {
    try {
      const res = await axiosInstance.get('/wishlist')
      if (res.data.success) {
        // backend might return Wishlist object where productIds is populated, or array of productIds/products.
        // Let's store just the IDs or the populated objects. Wait, the backend returns:
        // { success: true, data: { userId, productIds: [Product, Product] } }
        // Let's store the list of IDs for quick lookup, and we can also expose the populated products
        // so that the WishlistPage can display them! That's very smart.
        setWishlist(res.data.data.productIds || [])
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err)
    }
  }

  // Khởi tạo: đọc user từ localStorage khi app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('accessToken')
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  // Fetch wishlist when user is loaded
  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlist([])
    }
  }, [user])

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password })
    const data = res.data.data
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    const userInfo = {
      _id: data._id,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      phone: data.phone,
      loyaltyPoints: data.loyaltyPoints
    }
    localStorage.setItem('user', JSON.stringify(userInfo))
    setUser(userInfo)
    return data
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await axiosInstance.post('/auth/logout', { refreshToken })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.clear()
      setUser(null)
      setWishlist([])
    }
  }

  const register = async (formData) => {
    const res = await axiosInstance.post('/auth/register', formData)
    return res.data
  }

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để yêu thích sản phẩm!')
      return
    }
    try {
      const res = await axiosInstance.post('/wishlist/toggle', { productId })
      if (res.data.success) {
        // Backend returns: result.added ? 'added' : 'removed'
        const added = res.data.message.includes('thêm')
        if (added) {
          toast.success('Đã thêm sản phẩm vào danh sách yêu thích!')
        } else {
          toast.success('Đã xóa sản phẩm khỏi danh sách yêu thích!')
        }
        // Refresh wishlist
        fetchWishlist()
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err)
      toast.error(err.response?.data?.message || 'Không thể cập nhật danh sách yêu thích')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isLoggedIn: !!user,
        wishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
