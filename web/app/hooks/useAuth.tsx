/**
 * useAuth Hook
 * Manages authentication state and token lifecycle
 * (Temporary; will be replaced by NextAuth.js)
 */

'use client'

import { useContext, createContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { UserDto, AuthResponse } from '@/app/lib/types/dto'
import { api } from '@/app/lib/api'

interface AuthContextType {
  user: UserDto | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName?: string, businessName?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<UserDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const { accessToken } = api.auth.getTokens()
      if (accessToken) {
        try {
          // Verify token by fetching current user (endpoint TBD)
          const { data, error } = await api.get<UserDto>('/api/auth/me')
          if (data) {
            setUser(data)
          } else if (error?.statusCode === 401) {
            // Token expired or invalid
            api.auth.clearTokens()
          }
        } catch (err) {
          console.error('Failed to initialize auth:', err)
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await api.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      })

      if (error) {
        throw new Error(error.error || 'Login failed')
      }

      if (data) {
        api.auth.setTokens(data.accessToken, data.refreshToken)
        setUser(data.user)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(
    async (email: string, password: string, fullName?: string, businessName?: string) => {
      setIsLoading(true)
      try {
        const { data, error } = await api.post<AuthResponse>('/api/auth/signup', {
          email,
          password,
          fullName,
          businessName,
        })

        if (error) {
          throw new Error(error.error || 'Signup failed')
        }

        if (data) {
          api.auth.setTokens(data.accessToken, data.refreshToken)
          setUser(data.user)
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const logout = useCallback(() => {
    api.auth.clearTokens()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const { accessToken } = api.auth.getTokens()
    if (!accessToken) return

    try {
      const { data } = await api.get<UserDto>('/api/auth/me')
      if (data) {
        setUser(data)
      }
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
