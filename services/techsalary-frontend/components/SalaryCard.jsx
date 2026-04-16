'use client'

import { useState } from 'react'
import { vote } from '@/lib/api'

const BFF = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:5000'

function fmt(n, cur = 'LKR') {
  if (!n && n !== 0) return '—'
  return cur === 'LKR'
    ? 'LKR ' + Number(n).toLocaleString()
    : cur + ' ' + Number(n).toLocaleString()
}

export default function SalaryCard({ salary }) {
  const [upvotes,     setUpvotes]   = useState(salary.upvotes   || 0)
  const [downvotes,   setDownvotes] = useState(salary.downvotes || 0)
  const [voted,       setVoted]     = useState(null)
  const [voteError,   setVoteError] = useState(null)
  const [reporting,   setReporting] = useState(false)
  const [reported,    setReported]  = useState(false)
  const [reportError, setReportError] = useState(null)
  const [showReport,  setShowReport] = useState(false)

  const handleVote = async (type) => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login'
      return
    }
    if (voted) return
    try {
      await vote(salary.id, type)
      if (type === 'up')   setUpvotes(v => v + 1)
      if (type === 'down') setDownvotes(v => v + 1)
      setVoted(type)
    } catch (e) {
      setVoteError(e.message)
    }
  }

  const handleReport = async (reason) => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login'
      return
    }
    setReporting(true)
    setReportError(null)
    try {
      const res = await fetch(`${BFF}/api/report/${salary.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
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
    <div className="card hover:border-brand-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{salary.role}</h3>
            <span className="badge-approved">Approved</span>
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
            <p className="mt-2 text-xs text-gray-400">{salary.tech_stack}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold text-brand-700">
            {fmt(salary.salary_amount, salary.currency)}
          </p>
          <p className="text-xs text-gray-400">per month</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => handleVote('up')}
          className={
            'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ' +
            (voted === 'up'
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600')
          }
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          {upvotes}
        </button>
        <button
          onClick={() => handleVote('down')}
          className={
            'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ' +
            (voted === 'down'
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600')
          }
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {downvotes}
        </button>
        {voted && <span className="text-xs text-gray-400">Thanks for voting!</span>}
        {voteError && <span className="text-xs text-red-500">{voteError}</span>}
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
                className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600 text-center py-1"
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