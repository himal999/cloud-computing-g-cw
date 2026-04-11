'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface SalaryData {
  id: string
  country: string
  company: string
  role: string
  level: string
  yearsOfExperience: number
  salary: number
  currency: string
  bonus?: number
  stockOptions?: number
  workModel: string
  location: string
  upvotes: number
  downvotes: number
  totalCompensation: number
  createdAt: string
  approved: boolean
}

interface SearchFilters {
  country: string
  company: string
  role: string
  level: string
  workModel: string
  location: string
  minSalary: string
  maxSalary: string
}

export default function SearchSalaries() {
  const { user } = useAuth()
  const [salaries, setSalaries] = useState<SalaryData[]>([])
  const [filteredSalaries, setFilteredSalaries] = useState<SalaryData[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    country: '',
    company: '',
    role: '',
    level: '',
    workModel: '',
    location: '',
    minSalary: '',
    maxSalary: ''
  })
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchSalaries()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [salaries, filters])

  const fetchSalaries = async () => {
    try {
      const response = await fetch('/api/salaries')
      if (response.ok) {
        const data = await response.json()
        setSalaries(data)
      }
    } catch (error) {
      console.error('Failed to fetch salaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = salaries.filter(salary => salary.approved)

    if (filters.country) {
      filtered = filtered.filter(s => s.country === filters.country)
    }
    if (filters.company) {
      filtered = filtered.filter(s => s.company.toLowerCase().includes(filters.company.toLowerCase()))
    }
    if (filters.role) {
      filtered = filtered.filter(s => s.role.toLowerCase().includes(filters.role.toLowerCase()))
    }
    if (filters.level) {
      filtered = filtered.filter(s => s.level === filters.level)
    }
    if (filters.workModel) {
      filtered = filtered.filter(s => s.workModel === filters.workModel)
    }
    if (filters.location) {
      filtered = filtered.filter(s => s.location.toLowerCase().includes(filters.location.toLowerCase()))
    }
    if (filters.minSalary) {
      filtered = filtered.filter(s => s.totalCompensation >= Number(filters.minSalary))
    }
    if (filters.maxSalary) {
      filtered = filtered.filter(s => s.totalCompensation <= Number(filters.maxSalary))
    }

    setFilteredSalaries(filtered)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleVote = async (salaryId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      alert('Please login to vote on salary submissions')
      return
    }

    if (voting[salaryId]) return

    setVoting(prev => ({ ...prev, [salaryId]: true }))

    try {
      const response = await fetch(`/api/salaries/${salaryId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ voteType })
      })

      if (response.ok) {
        fetchSalaries()
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setVoting(prev => ({ ...prev, [salaryId]: false }))
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getVoteScore = (upvotes: number, downvotes: number) => {
    return upvotes - downvotes
  }

  const getVotePercentage = (upvotes: number, downvotes: number) => {
    const total = upvotes + downvotes
    if (total === 0) return 0
    return Math.round((upvotes / total) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-gray-600/15 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading salary data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-gray-600/15 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15"></div>
      
      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-2xl">
            Search Salary Data
          </h1>
          <p className="text-lg text-gray-200 font-light leading-relaxed max-w-2xl mx-auto mb-6">
            Browse anonymous salary submissions from the tech community. Filter by country, company, role, and more.
          </p>
          {!user && (
            <div className="flex justify-center gap-4">
              <Link 
                href="/login" 
                className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
              >
                Login to Vote
              </Link>
              <span className="text-gray-400">|</span>
              <Link 
                href="/register" 
                className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

          <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={filters.country}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">All Countries</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="LK">Sri Lanka</option>
                  <option value="IN">India</option>
                  <option value="SG">Singapore</option>
                  <option value="JP">Japan</option>
                </select>
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  placeholder="Search company..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  placeholder="Search role..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  id="level"
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">All Levels</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Principal">Principal</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                </select>
              </div>

              <div>
                <label htmlFor="workModel" className="block text-sm font-medium text-gray-700 mb-1">
                  Work Model
                </label>
                <select
                  id="workModel"
                  name="workModel"
                  value={filters.workModel}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">All Models</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Search location..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Salary
                </label>
                <input
                  type="number"
                  id="minSalary"
                  name="minSalary"
                  value={filters.minSalary}
                  onChange={handleFilterChange}
                  placeholder="Min total comp..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Salary
                </label>
                <input
                  type="number"
                  id="maxSalary"
                  name="maxSalary"
                  value={filters.maxSalary}
                  onChange={handleFilterChange}
                  placeholder="Max total comp..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-4 text-white">
            <p className="text-sm">
              Found <span className="font-bold text-blue-400">{filteredSalaries.length}</span> salary submissions
              {filteredSalaries.length !== salaries.length && ` (filtered from ${salaries.length} total)`}
            </p>
          </div>

          <div className="space-y-4">
            {filteredSalaries.map((salary) => (
              <div key={salary.id} className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{salary.role}</h3>
                    <p className="text-lg text-gray-700 font-medium">{salary.company}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {salary.level}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {salary.workModel}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        {salary.yearsOfExperience} years
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {salary.country}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(salary.totalCompensation, salary.currency)}
                    </div>
                    <div className="text-sm text-gray-600">Total Compensation</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Base Salary:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {formatCurrency(salary.salary, salary.currency)}
                    </span>
                  </div>
                  {salary.bonus && salary.bonus > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Bonus:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatCurrency(salary.bonus, salary.currency)}
                      </span>
                    </div>
                  )}
                  {salary.stockOptions && salary.stockOptions > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Stock Options:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatCurrency(salary.stockOptions, salary.currency)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{salary.location}</span>
                    <span className="mx-2">·</span>
                    <span>{new Date(salary.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(salary.id, 'upvote')}
                        disabled={!user || voting[salary.id]}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          !user 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : voting[salary.id]
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={!user ? 'Login to vote' : 'Upvote'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        {salary.upvotes}
                      </button>
                      
                      <button
                        onClick={() => handleVote(salary.id, 'downvote')}
                        disabled={!user || voting[salary.id]}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          !user 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : voting[salary.id]
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        title={!user ? 'Login to vote' : 'Downvote'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {salary.downvotes}
                      </button>

                      <div className="flex items-center gap-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getVotePercentage(salary.upvotes, salary.downvotes)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {getVoteScore(salary.upvotes, salary.downvotes)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSalaries.length === 0 && (
            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-12 text-center">
              <div className="text-gray-500 text-lg">
                {salaries.length === 0 
                  ? 'No salary submissions yet. Be the first to submit!'
                  : 'No salaries match your filters. Try adjusting your search criteria.'
                }
              </div>
              {salaries.length === 0 && (
                <button
                  onClick={() => window.location.href = '/submit'}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold"
                >
                  Submit First Salary
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
