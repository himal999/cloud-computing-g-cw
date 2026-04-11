'use client'

import { useState, useEffect } from 'react'

interface StatsData {
  totalSubmissions: number
  averageSalary: number
  medianSalary: number
  topCompanies: Array<{ company: string; count: number; avgSalary: number }>
  topRoles: Array<{ role: string; count: number; avgSalary: number }>
  salaryByCountry: Array<{ country: string; avgSalary: number; count: number }>
  salaryByLevel: Array<{ level: string; avgSalary: number; count: number }>
  salaryByWorkModel: Array<{ workModel: string; avgSalary: number; count: number }>
  salaryDistribution: Array<{ range: string; count: number }>
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string>('')

  useEffect(() => {
    fetchStats()
  }, [selectedCountry])

  const fetchStats = async () => {
    try {
      const url = selectedCountry 
        ? `/api/stats?country=${selectedCountry}`
        : '/api/stats'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      'US': 'United States',
      'UK': 'United Kingdom',
      'CA': 'Canada',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'LK': 'Sri Lanka',
      'IN': 'India',
      'SG': 'Singapore',
      'JP': 'Japan'
    }
    return countries[code] || code
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-gray-600/15 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading statistics...</div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-gray-600/15 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">No statistics available</div>
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-2xl">
              Salary Statistics & Analytics
            </h1>
            <p className="text-lg text-gray-200 font-light leading-relaxed max-w-2xl mx-auto">
              Comprehensive salary insights and trends from the tech community. Explore compensation data across different dimensions.
            </p>
          </div>

          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                <label htmlFor="countryFilter" className="text-sm font-medium text-gray-700">
                  Filter by Country:
                </label>
                <select
                  id="countryFilter"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Submissions</h3>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalSubmissions.toLocaleString()}</div>
              <p className="text-sm text-gray-600 mt-1">Approved submissions</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Average Salary</h3>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2-3-.895-3-2zm0 0c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.averageSalary)}</div>
              <p className="text-sm text-gray-600 mt-1">Mean total compensation</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Median Salary</h3>
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.medianSalary)}</div>
              <p className="text-sm text-gray-600 mt-1">Median total compensation</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Avg per Submission</h3>
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.totalSubmissions > 0 ? Math.round(stats.averageSalary / stats.totalSubmissions) : 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">Data points per entry</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Companies</h3>
              <div className="space-y-3">
                {stats.topCompanies.map((company, index) => (
                  <div key={company.company} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{company.company}</div>
                        <div className="text-sm text-gray-600">{company.count} submissions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(company.avgSalary)}</div>
                      <div className="text-xs text-gray-500">avg total comp</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Roles</h3>
              <div className="space-y-3">
                {stats.topRoles.map((role, index) => (
                  <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{role.role}</div>
                        <div className="text-sm text-gray-600">{role.count} submissions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(role.avgSalary)}</div>
                      <div className="text-xs text-gray-500">avg total comp</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Salary by Country</h3>
              <div className="space-y-3">
                {stats.salaryByCountry.map((country) => (
                  <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{getCountryName(country.country)}</div>
                      <div className="text-sm text-gray-600">{country.count} submissions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(country.avgSalary)}</div>
                      <div className="text-xs text-gray-500">avg total comp</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Salary by Experience Level</h3>
              <div className="space-y-3">
                {stats.salaryByLevel.map((level) => (
                  <div key={level.level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{level.level}</div>
                      <div className="text-sm text-gray-600">{level.count} submissions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(level.avgSalary)}</div>
                      <div className="text-xs text-gray-500">avg total comp</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Salary by Work Model</h3>
              <div className="space-y-3">
                {stats.salaryByWorkModel.map((model) => (
                  <div key={model.workModel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-900">{model.workModel}</div>
                      <div className="text-sm text-gray-600">{model.count} submissions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{formatCurrency(model.avgSalary)}</div>
                      <div className="text-xs text-gray-500">avg total comp</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Salary Distribution</h3>
              <div className="space-y-3">
                {stats.salaryDistribution.map((range) => (
                  <div key={range.range} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{range.range}</span>
                      <span className="text-sm text-gray-600">{range.count} submissions</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stats.totalSubmissions > 0 ? (range.count / stats.totalSubmissions) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
