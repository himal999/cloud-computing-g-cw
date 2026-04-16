'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const BFF = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:5000'

function fmt(n, cur = 'LKR') {
  if (!n && n !== 0) return '—'
  return cur === 'LKR'
    ? 'LKR ' + Number(n).toLocaleString()
    : cur + ' ' + Number(n).toLocaleString()
}

function PendingCard({ salary, token, onVoted }) {
  const [voting,      setVoting]    = useState(false)
  const [voted,       setVoted]     = useState(null)
  const [error,       setError]     = useState(null)
  const [reported,    setReported]  = useState(false)
  const [reporting,   setReporting] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [showReport,  setShowReport] = useState(false)
  const [counts, setCounts] = useState({
    upvotes:   salary.upvotes   || 0,
    downvotes: salary.downvotes || 0,
  })

  const handleVote = async (type) => {
    if (!token) { window.location.href = '/login'; return }
    if (voted) return
    setVoting(true)
    setError(null)
    try {
      const res = await fetch(`${BFF}/api/vote/${salary.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vote_type: type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Vote failed')
      setVoted(type)
      setCounts({ upvotes: data.upvotes || 0, downvotes: data.downvotes || 0 })
      if (data.status === 'APPROVED') {
        setTimeout(() => onVoted(salary.id), 1500)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setVoting(false)
    }
  }

  const handleReport = async (reason) => {
    if (!token) { window.location.href = '/login'; return }
    setReporting(true)
    setReportError(null)
    try {
      const res = await fetch(`${BFF}/api/report/${salary.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Report failed')
      setReported(true)
      setShowReport(false)
    } catch (e) {
      setReportError(e.message)
    } finally {
      setReporting(false)
    }
  }

  return (
    <div className="card border-l-4 border-l-yellow-400">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{salary.role}</h3>
            <span className="badge-pending">Pending review</span>
            {salary.level && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {salary.level}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            {!salary.anonymize && salary.company && <span>{salary.company}</span>}
            {salary.location && <span>{salary.location}</span>}
            {salary.years_of_experience !== undefined && (
              <span>
                {salary.years_of_experience} yr{salary.years_of_experience !== 1 ? 's' : ''} exp
              </span>
            )}
          </div>
          {salary.tech_stack && (
            <p className="mt-1 text-xs text-gray-400">{salary.tech_stack}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-brand-700">
            {fmt(salary.salary_amount, salary.currency)}
          </p>
          <p className="text-xs text-gray-400">per month</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Approval progress</span>
          <span>{counts.upvotes} / 3 upvotes needed</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((counts.upvotes / 3) * 100, 100)}%` }}
          />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => handleVote('up')}
          disabled={voting || !!voted}
          className={
            'flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ' +
            (voted === 'up'
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600 hover:bg-green-50')
          }
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Looks legit ({counts.upvotes})
        </button>
        <button
          onClick={() => handleVote('down')}
          disabled={voting || !!voted}
          className={
            'flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ' +
            (voted === 'down'
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50')
          }
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Seems off ({counts.downvotes})
        </button>
        {voted && (
          <span className="text-xs text-green-600 font-medium">
            {voted === 'up' ? '✓ Upvote recorded!' : '✓ Downvote recorded!'}
          </span>
        )}
        {error && <span className="text-xs text-red-500">{error}</span>}
        <div className="ml-auto relative">
          {reported ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Reported
            </span>
          ) : (
            <button
              onClick={() => setShowReport(p => !p)}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Report
            </button>
          )}

          {showReport && !reported && (
            <div className="absolute right-0 bottom-10 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-10 w-52">
              <p className="text-xs font-semibold text-gray-700 mb-2 px-1">
                Why are you reporting?
              </p>
              {['fake', 'duplicate', 'inappropriate', 'other'].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReport(reason)}
                  disabled={reporting}
                  className="flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-600 capitalize disabled:opacity-50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {reason}
                </button>
              ))}
              {reportError && (
                <p className="text-xs text-red-500 mt-2 px-1">{reportError}</p>
              )}
              <button
                onClick={() => setShowReport(false)}
                className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 text-center py-1 border-t border-gray-100 pt-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default function PendingPage() {
  const router                  = useRouter()
  const [token, setToken]       = useState(null)
  const [salaries, setSalaries] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (!t) { router.push('/login'); return }
    setToken(t)
  }, [router])

  const loadPending = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${BFF}/api/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setSalaries(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) loadPending()
  }, [token, loadPending])

  const handleVoted = (id) => {
    setSalaries(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Salaries</h1>
            <p className="text-gray-500 text-sm mt-1">
              Review submissions waiting for community approval. 3 upvotes needed.
            </p>
          </div>
          <button onClick={loadPending} className="btn-secondary text-sm">
            Refresh
          </button>
        </div>
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          You are logged in as a community member. Vote to help verify salary submissions.
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading pending salaries...</p>
          </div>
        </div>
      ) : salaries.length === 0 ? (
        <div className="text-center py-16 card text-gray-500">
          <p className="font-medium text-lg">No pending salaries right now</p>
          <p className="text-sm mt-1">All submissions have been reviewed!</p>
          <a href="/" className="btn-primary text-sm mt-4 inline-block">
            Browse Approved Salaries
          </a>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {salaries.length} submission{salaries.length !== 1 ? 's' : ''} waiting for review
          </p>
          <div className="grid gap-4">
            {salaries.map(s => (
              <PendingCard key={s.id} salary={s} token={token} onVoted={handleVoted} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}