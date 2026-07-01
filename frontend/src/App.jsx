import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminProtectedRoute from './components/common/AdminProtectedRoute'
import ScrollToTop from './components/common/ScrollToTop'
import { Toaster } from 'react-hot-toast'

// Layout components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Core Pages
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import WishlistPage from './pages/WishlistPage'
import NotFoundPage from './pages/NotFoundPage'
import VouchersPage from './pages/VouchersPage'
import NewsPage from './pages/NewsPage'
import ContactPage from './pages/ContactPage'
import VnpayReturnPage from './pages/VnpayReturnPage'

// Admin Panel Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminVouchersPage from './pages/admin/AdminVouchersPage'
import AdminFlashSalesPage from './pages/admin/AdminFlashSalesPage'

import './index.css'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster position="top-center" reverseOrder={false} />
          
          <Routes>
            {/* Auth routes without Header/Footer */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Public routes inside layout */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/products/:slug" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/vouchers" element={<Layout><VouchersPage /></Layout>} />
            <Route path="/news" element={<Layout><NewsPage /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPage /></Layout>} />

            {/* Protected user routes inside layout */}
            <Route
              path="/cart"
              element={
                <Layout>
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/checkout"
              element={
                <Layout>
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/order-success/:orderId"
              element={
                <Layout>
                  <ProtectedRoute>
                    <OrderSuccessPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/vnpay-return"
              element={
                <Layout>
                  <ProtectedRoute>
                    <VnpayReturnPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/orders"
              element={
                <Layout>
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <Layout>
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/wishlist"
              element={
                <Layout>
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* Admin Panel routes (Protected by AdminProtectedRoute) */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/edit/:slug" element={<AdminProductFormPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="vouchers" element={<AdminVouchersPage />} />
              <Route path="flash-sales" element={<AdminFlashSalesPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
