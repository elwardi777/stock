import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useSnackbar } from 'notistack'
import { User } from '../types'
import { authApi } from '../services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: object) => Promise<void>
  updateUser: (user: User) => void
  hasPermission: (module: string, action: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isLoggingOutRef = useRef(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authApi.me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    const { access_token, refresh_token, user: userData } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    queryClient.clear()
    setUser(userData)
  }, [queryClient])

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return
    isLoggingOutRef.current = true
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      const accessToken = localStorage.getItem('access_token')
      if (accessToken || refreshToken) {
        try {
          await authApi.logout(refreshToken)
        } catch {
          // Proceed with local logout even if network/token already expired
        }
      }
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      queryClient.clear()
      setUser(null)
      isLoggingOutRef.current = false
      enqueueSnackbar('Vous avez été déconnecté avec succès', { variant: 'info' })
      navigate('/login', { replace: true })
    }
  }, [navigate, queryClient, enqueueSnackbar])

  const register = useCallback(async (data: object) => {
    await authApi.register(data)
  }, [])

  const updateUser = useCallback((u: User) => setUser(u), [])

  const hasPermission = useCallback((module: string, action: string): boolean => {
    if (!user) return false
    if (user.role === 'administrator') return true
    return user.permissions?.[module]?.[action] === true
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated: !!user,
      login, logout, register, updateUser, hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
