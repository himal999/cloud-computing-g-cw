'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const GREETINGS = [
  { country: 'US', text: 'Welcome back' },
  { country: 'UK', text: 'Welcome back' },
  { country: 'Canada', text: 'Welcome back' },
  { country: 'Australia', text: 'Welcome back' },
  { country: 'Germany', text: 'Willkommen zuruck' },
  { country: 'France', text: 'Bon retour' },
  { country: 'Sri Lanka', text: 'Ayubowan' },
  { country: 'India', text: 'Swagat hai wapas' },
  { country: 'Singapore', text: 'Welcome back' },
  { country: 'Japan', text: 'Okaeri nasai' }
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [greetingIndex, setGreetingIndex] = useState(0)
  const { login, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % GREETINGS.length)
    }, 2500)

    return () => clearInterval(intervalId)
  }, [])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Clear previous general errors
    setErrors(prev => ({ ...prev, general: undefined }))
    
    const result = await login({ email, password })
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setErrors({ general: result.error || 'Login failed' })
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
              Track and compare salaries across companies and roles
            </p>
          </div>
          
          <h2 className="text-xl font-light tracking-tight mb-6">
            <span
              key={greetingIndex}
              className="typing-effect text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-200 drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]"
            >
              {GREETINGS[greetingIndex].text} ({GREETINGS[greetingIndex].country})
            </span>
          </h2>
        </div>
        
        <form className="bg-transparent backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 max-w-md w-full text-white" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 bg-red-500/20 border border-red-300/40 text-white px-4 py-3 rounded-xl text-xs font-light">
              {errors.general}
            </div>
          )}
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-light text-white mb-2 tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-xs font-light text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.email ? 'border-red-300/70 bg-red-500/10' : 'hover:border-white/35'}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-white font-light">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-light text-white mb-2 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-xs font-light text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.password ? 'border-red-300/70 bg-red-500/10' : 'hover:border-white/35'}`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-white font-light">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg bg-gray-50"
              />
              <label htmlFor="remember-me" className="ml-3 block text-xs font-light text-white">
                Remember me
              </label>
            </div>

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
                    Signing in...
                  </>
                ) : (
                  'Sign in to your account'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Form Description */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-xs font-light text-gray-300 leading-relaxed">
            Access your personalized salary dashboard and analytics
          </p>
          <p className="text-xs font-light text-gray-300">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="font-light text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
            >
              Get started here
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <h3 className="text-sm font-light text-white mb-4 text-center">Trusted by professionals worldwide</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-xl font-semibold text-blue-400">50K+</div>
                <div className="text-xs text-gray-300 font-light">Active Users</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-semibold text-blue-400">1M+</div>
                <div className="text-xs text-gray-300 font-light">Salary Records</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-semibold text-blue-400">500+</div>
                <div className="text-xs text-gray-300 font-light">Companies</div>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-semibold text-blue-400">4.8</div>
                <div className="text-xs text-gray-300 font-light">User Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-gray-400 text-xs">
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Bank-level security and data encryption</span>
        </div>
      </div>
      </div>
    </div>
  )
}
