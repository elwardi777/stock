import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'
import { useAuth } from './contexts/AuthContext'

// Layouts
import ClientLayout from './layouts/ClientLayout/ClientLayout'
import AdminLayout from './layouts/AdminLayout/AdminLayout'
import DeliveryLayout from './layouts/DeliveryLayout/DeliveryLayout'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Client pages
import HomePage from './pages/client/home/HomePage'
import ProductsPage from './pages/client/products/ProductsPage'
import ProductDetailPage from './pages/client/products/ProductDetailPage'
import CartPage from './pages/client/cart/CartPage'
import CheckoutPage from './pages/client/checkout/CheckoutPage'
import ClientProfilePage from './pages/client/profile/ClientProfilePage'
import ClientOrdersPage from './pages/client/orders/ClientOrdersPage'

// Admin pages
import AdminDashboard from './pages/admin/dashboard/AdminDashboard'
import UsersPage from './pages/admin/users/UsersPage'
import AdminProductsPage from './pages/admin/products/AdminProductsPage'
import StockPage from './pages/admin/stock/StockPage'
import OrdersPage from './pages/admin/orders/OrdersPage'
import DeliveriesPage from './pages/admin/deliveries/DeliveriesPage'
import PromotionsPage from './pages/admin/promotions/PromotionsPage'
import FinancePage from './pages/admin/finance/FinancePage'
import AuditPage from './pages/admin/audit/AuditPage'
import SettingsPage from './pages/admin/settings/SettingsPage'

// Delivery pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'

const ProtectedRoute: React.FC<{
  children: React.ReactNode
  roles?: string[]
}> = ({ children, roles }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

const App: React.FC = () => {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['administrator', 'gestionnaire']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="deliveries" element={<DeliveriesPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Delivery */}
      <Route path="/delivery" element={
        <ProtectedRoute roles={['livreur']}>
          <DeliveryLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DeliveryDashboard />} />
      </Route>

      {/* Client */}
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<HomePage />} />
        <Route path="produits" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="produits/:slug" element={<ProductDetailPage />} />
        <Route path="panier" element={<CartPage />} />
        <Route path="commande" element={
          <ProtectedRoute roles={['client']}>
            <CheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="profil" element={
          <ProtectedRoute roles={['client']}>
            <ClientProfilePage />
          </ProtectedRoute>
        } />
        <Route path="mes-commandes" element={
          <ProtectedRoute roles={['client']}>
            <ClientOrdersPage />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
