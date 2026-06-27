import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isLoggedIn } = useAuth()

  const fetchCart = async () => {
    if (!isLoggedIn) {
      setCart(null)
      return
    }
    try {
      setLoading(true)
      const res = await axiosInstance.get('/cart')
      // Lấy data từ response.data.data
      setCart(res.data.data)
    } catch (err) {
      console.error('Error fetching cart:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart()
    } else {
      setCart(null)
    }
  }, [isLoggedIn])

  const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, cartCount, setCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
