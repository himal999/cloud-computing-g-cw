'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
    general?: string;
  }>({})
  const { register, isLoading } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      agreeToTerms?: string;
    } = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Clear previous general errors
    setErrors(prev => ({ ...prev, general: undefined }))
    
    const result = await register({ 
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email, 
      password: formData.password 
    })
    
    if (result.success) {
      router.push('/login?message=Registration successful! Please log in.')
    } else {
      setErrors({ general: result.error || 'Registration failed' })
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4 sm:px-6 lg:px-8">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-gray-600/15 animate-pulse"></div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/8 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/8 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-gray-500/8 rounded-full blur-2xl animate-pulse animation-delay-4000"></div>
      </div>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15"></div>
      
      {/* Content container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mb-4">
            <h1 className="text-4xl font-thin text-white mb-2 tracking-tight drop-shadow-2xl">
              Salary Track
            </h1>
            <p className="text-base text-gray-200 font-extralight leading-relaxed max-w-sm mx-auto">
              Join thousands of professionals tracking their career growth
            </p>
          </div>
          
          <h2 className="text-xl font-light text-white tracking-tight mb-6">
            Create your account
          </h2>
        </div>
        
        <form className="bg-transparent backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 max-w-md w-full text-white" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 bg-red-500/20 border border-red-300/40 text-white px-4 py-3 rounded-xl text-xs font-light">
              {errors.general}
            </div>
          )}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-light text-white mb-2 tracking-wide">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-transparent border border-white/20 rounded-xl text-xs font-light text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.firstName ? 'border-red-300/70 bg-red-500/10' : 'hover:border-white/35'}`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-2 text-xs text-white font-light">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-xs font-light text-white mb-2 tracking-wide">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-transparent border border-white/20 rounded-xl text-xs font-light text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.lastName ? 'border-red-300/70 bg-red-500/10' : 'hover:border-white/35'}`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-white font-light">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-light text-white mb-2 tracking-wide">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-transparent border border-white/20 rounded-xl text-xs font-light text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.email ? 'border-red-300/70 bg-red-500/10' : 'hover:border-white/35'}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-white font-light">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-light text-white mb-2 tracking-wide">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-transparent border border-white/20 rounded-xl text-xs font-light text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.password ? 'border-red-300/70 bg-red-500/10' : 'hover:border-white/35'}`}
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-white font-light">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-red-300 font-light">
                Must contain at least 8 characters, including uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-light text-white mb-2 tracking-wide">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-transparent border border-white/20 rounded-xl text-xs font-light text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.confirmPassword ? 'border-red-300/70 bg-red-500/10' : 'hover:border-white/35'}`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-white font-light">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg bg-gray-50 mt-1 ${errors.agreeToTerms ? 'border-red-400' : ''}`}
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-xs text-white/80 font-light leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-cyan-300 hover:text-cyan-200 font-light underline transition-colors duration-200">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-cyan-300 hover:text-cyan-200 font-light underline transition-colors duration-200">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-xs text-white font-light">{errors.agreeToTerms}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-light text-sm shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create your account'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Form Description */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-xs font-light text-gray-300 leading-relaxed">
            Start your journey to better salary insights
          </p>
          <p className="text-xs font-light text-gray-300">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-light text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
