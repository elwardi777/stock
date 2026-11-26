import axios from 'axios'
import { authStorage } from '../utils/authStorage'

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach JWT from current tab's sessionStorage
api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401 within the current tab only
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthAttempt =
      original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && original && !original._retry && !isAuthAttempt) {
      original._retry = true
      const refreshToken = authStorage.getRefreshToken()
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })
          const { access_token } = res.data
          authStorage.setAccessToken(access_token)
          original.headers.Authorization = `Bearer ${access_token}`
          return api(original)
        } catch {
          authStorage.clearTokens()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      } else {
        authStorage.clearTokens()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  logout: (refreshToken?: string | null) =>
    api.post('/auth/logout', refreshToken ? { refresh_token: refreshToken } : {}),
  me: () => api.get('/auth/me'),
  refresh: (token: string) => api.post('/auth/refresh', { refresh_token: token }),
  changePassword: (data: object) => api.post('/auth/change-password', data),
  updateMe: (data: object) => api.put('/auth/me', data),
}

// Users
export const usersApi = {
  list: (params?: object) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: object) => api.post('/users', data),
  update: (id: string, data: object) => api.put(`/users/${id}`, data),
  updatePermissions: (id: string, permissions: object) =>
    api.put(`/users/${id}/permissions`, { permissions }),
  delete: (id: string) => api.delete(`/users/${id}`),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
}

// Products
export const productsApi = {
  list: (params?: object) => api.get('/products', { params }),
  listPublic: (params?: object) => api.get('/products/public', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) =>
    api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/products/${id}`),
  toggleVisibility: (id: string) => api.patch(`/products/${id}/toggle-visibility`),
}

// Categories
export const categoriesApi = {
  list: () => api.get('/categories'),
  listAll: () => api.get('/categories/all'),
  create: (data: object) => api.post('/categories', data),
  update: (id: string, data: object) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

// Stock
export const stockApi = {
  overview: () => api.get('/stock'),
  adjust: (data: object) => api.post('/stock/adjust', data),
  movements: (params?: object) => api.get('/stock/movements', { params }),
}

// Orders
export const ordersApi = {
  list: (params?: object) => api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: object) => api.post('/orders', data),
  updateStatus: (id: string, data: object) => api.patch(`/orders/${id}/status`, data),
  assignLivreur: (id: string, livreurId: string) =>
    api.patch(`/orders/${id}/assign-livreur`, { livreur_id: livreurId }),
}

// Dashboard
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
}

// Finance
export const financeApi = {
  summary: (period: string) => api.get('/finance/summary', { params: { period } }),
  revenueChart: (days: number) => api.get('/finance/revenue-chart', { params: { days } }),
  topProducts: (limit: number) => api.get('/finance/top-products', { params: { limit } }),
}

// Promotions
export const promotionsApi = {
  list: (params?: object) => api.get('/promotions', { params }),
  activePublic: () => api.get('/promotions/active-public'),
  create: (data: object) => api.post('/promotions', data),
  update: (id: string, data: object) => api.put(`/promotions/${id}`, data),
  delete: (id: string) => api.delete(`/promotions/${id}`),
}

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: object) => api.put('/settings', data),
}

// Audit
export const auditApi = {
  list: (params?: object) => api.get('/audit', { params }),
}

// Deliveries
export const deliveriesApi = {
  myDeliveries: (params?: object) => api.get('/deliveries/my-deliveries', { params }),
  livreurs: () => api.get('/deliveries/livreurs'),
}

// Permissions
export const permissionsApi = {
  modules: () => api.get('/permissions/modules'),
  myPermissions: () => api.get('/permissions/my-permissions'),
}

// Commercial Clients & Daily Needs
export const clientsApi = {
  list: (params?: object) => api.get('/clients', { params }),
  create: (data: object) => api.post('/clients', data),
  addNeed: (clientId: string, data: object) => api.post(`/clients/${clientId}/needs`, data),
  updateNeed: (clientId: string, needId: string, data: object) =>
    api.patch(`/clients/${clientId}/needs/${needId}`, data),
  deleteNeed: (clientId: string, needId: string) =>
    api.delete(`/clients/${clientId}/needs/${needId}`),
}
