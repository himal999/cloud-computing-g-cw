'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient, LoginRequest, SignUpRequest } from '@/lib/api'

interface User {
  email: string
  firstName?: string
  lastName?: string
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
    const firstName = localStorage.getItem('userFirstName')
    const lastName = localStorage.getItem('userLastName')
    
    if (token && email) {
      setUser({ email, firstName: firstName || undefined, lastName: lastName || undefined, token })
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
        const firstName = response.data.firstName
        const lastName = response.data.lastName
        
        localStorage.setItem('authToken', token)
        localStorage.setItem('userEmail', email)
        if (firstName) localStorage.setItem('userFirstName', firstName)
        if (lastName) localStorage.setItem('userLastName', lastName)
        
        setUser({ email, firstName, lastName, token })
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
    localStorage.removeItem('userFirstName')
    localStorage.removeItem('userLastName')
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
