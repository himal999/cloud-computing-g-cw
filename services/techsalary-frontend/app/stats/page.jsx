'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStats } from '@/lib/api'

const ROLES = [
  'Software Engineer','Senior Software Engineer','Frontend Developer',
  'Backend Developer','Full Stack Developer','DevOps Engineer',
  'Data Engineer','Data Scientist','ML Engineer','Product Manager',
]

function StatCard({ label, value, sub }) {
  return (
    <div className="card text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-brand-700">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function fmt(n, cur = 'LKR') {
  if (!n && n !== 0) return '—'
  return cur === 'LKR'
    ? `LKR ${Number(n).toLocaleString()}`
    : `${cur} ${Number(n).toLocaleString()}`
}

export default function StatsPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [role, setRole]       = useState('')
  const [location, setLocation] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const data = await getStats({ role, location })
      setStats(data)
    } catch {
      setError('Failed to load statistics. Is the BFF service running?')
    } finally {
      setLoading(false)
    }
  }, [role, location])

  useEffect(() => { load() }, [load])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Salary Statistics</h1>
        <p className="text-gray-500 text-sm mt-1">Aggregated from approved community submissions.</p>
      </div>
      <div className="card mb-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select value={role} onChange={e => setRole(e.target.value)} className="input-field">
            <option value="">All roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input type="text" placeholder="Location (e.g. Colombo)"
            value={location} onChange={e => setLocation(e.target.value)} className="input-field" />
          <button onClick={load} disabled={loading} className="btn-primary text-sm">
            {loading ? 'Loading...' : 'Update'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            <StatCard label="Total entries"  value={stats.count        ?? '—'} />
            <StatCard label="Average salary" value={fmt(stats.average, stats.currency)} sub="per month" />
            <StatCard label="Median salary"  value={fmt(stats.median,  stats.currency)} sub="per month" />
            <StatCard label="Top 25%"        value={fmt(stats.p75,     stats.currency)} sub="per month" />
          </div>

          {stats.min != null && stats.max != null && (
            <div className="card mb-8">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Salary range</h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">{fmt(stats.min, stats.currency)}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="font-medium">{fmt(stats.max, stats.currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 px-0">
                <span>Minimum</span><span>Maximum</span>
              </div>
            </div>
          )}

          {stats.by_role && stats.by_role.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Average by role</h2>
              <div className="divide-y divide-gray-100">
                {stats.by_role.map((r) => {
                  const pct = stats.max ? Math.round((r.average / stats.max) * 100) : 50
                  return (
                    <div key={r.role} className="py-3 flex items-center gap-4">
                      <span className="text-sm text-gray-700 w-48 shrink-0 truncate">{r.role}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full transition-all"
                          style={{ width: pct + '%' }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-36 text-right shrink-0">
                        {fmt(r.average, stats.currency)}
                      </span>
                      <span className="text-xs text-gray-400 w-16 text-right shrink-0">{r.count} entries</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {stats.count === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p className="font-medium">No data yet for this filter</p>
              <a href="/submit" className="btn-primary text-sm mt-3 inline-block">Be the first to submit</a>
            </div>
          )}
        </>
      )}
    </div>
  )
}
