'use client'

import { useState, useEffect, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import SalaryCard from '@/components/SalaryCard'
import { searchSalaries } from '@/lib/api'

export default function HomePage() {
  const [salaries, setSalaries] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [total, setTotal]       = useState(0)

  const handleSearch = useCallback(async (filters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await searchSalaries(filters)
      const list = Array.isArray(data) ? data : (data.salaries || [])
      setSalaries(list)
      setTotal(list.length)
    } catch {
      setError('Failed to load salaries. Is the BFF service running?')
      setSalaries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { handleSearch({}) }, [handleSearch])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Sri Lanka Tech Salary Transparency
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
          Browse anonymous salary data submitted by the Sri Lanka tech community.
          No login required to search or submit.
        </p>
        <div className="flex justify-center gap-3 mt-5">
          <a href="/submit" className="btn-primary text-sm">Submit Your Salary</a>
          <a href="/stats"  className="btn-secondary text-sm">View Statistics</a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-2xl font-bold text-brand-600">{total}</p>
          <p className="text-xs text-gray-500 mt-1">Approved entries</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-brand-600">100%</p>
          <p className="text-xs text-gray-500 mt-1">Anonymous</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-brand-600">Free</p>
          <p className="text-xs text-gray-500 mt-1">No account needed</p>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} />

      <div className="mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading salaries...</p>
            </div>
          </div>
        ) : salaries.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg font-medium">No salaries found</p>
            <p className="text-sm mt-1">Try adjusting your filters or be the first to submit!</p>
            <a href="/submit" className="btn-primary text-sm mt-4 inline-block">Submit a Salary</a>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {salaries.length} {salaries.length === 1 ? 'entry' : 'entries'}
            </p>
            <div className="grid gap-4">
              {salaries.map((s) => <SalaryCard key={s.id} salary={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
