'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient, LoginRequest, SignUpRequest } from '@/lib/api'

interface User {
  email: string
  token?: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  register: (userData: SignUpRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const email = localStorage.getItem('userEmail')
    
    if (token && email) {
      setUser({ email, token })
    }
  }, [])

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(credentials)
      
      if (response.error) {
        return { success: false, error: response.error }
      }
      
      if (response.data) {
        const token = response.data.token || 'mock-token'
        const email = credentials.email
        
        localStorage.setItem('authToken', token)
        localStorage.setItem('userEmail', email)
        
        setUser({ email, token })
        return { success: true }
      }
      
      return { success: false, error: 'Login failed' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: SignUpRequest): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const response = await apiClient.signup(userData)
      
      if (response.error) {
        return { success: false, error: response.error }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Registration failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
