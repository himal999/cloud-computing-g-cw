'use client'

import { useState } from 'react'
import { login, signup } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode]         = useState('login')
  const [form, setForm]         = useState({ email: '', password: '', confirm: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [fieldErrors, setFE]    = useState({})

  const validate = () => {
    const e = {}
    if (!form.email || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = 'Enter a valid email address'
    if (!form.password || form.password.length < 8)
      e.password = 'Password must be at least 8 characters'
    if (mode === 'signup' && form.password !== form.confirm)
      e.confirm = 'Passwords do not match'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    setFE(p => ({ ...p, [name]: undefined }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFE(errs); return }
    setLoading(true); setError(null)
    try {
      const data = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await signup({ email: form.email, password: form.password })
      localStorage.setItem('token', data.token || data.access_token)
      localStorage.setItem('user', JSON.stringify({ email: form.email }))
      router.push('/')
    } catch (err) {
      setError(err.message || (mode === 'login' ? 'Invalid credentials.' : 'Signup failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
          {['login','signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setFE({}) }}
              className={"flex-1 py-2.5 text-sm font-medium transition-colors " +
                (mode === m ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}>
              {m === 'login' ? 'Log in' : 'Sign up'}
            </button>
          ))}
        </div>

        <div className="card">
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-gray-500 mb-5">
            {mode === 'login'
              ? 'Log in to upvote and downvote salary entries.'
              : 'Sign up to participate in community voting.'}
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" autoComplete="email" className="input-field" />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="Min. 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="input-field" />
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
                  placeholder="Repeat your password" autoComplete="new-password" className="input-field" />
                {fieldErrors.confirm && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirm}</p>}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                  </span>
                : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Login is only needed for voting. Salary submission is always anonymous and requires no account.
          </p>
        </div>
      </div>
    </div>
  )
}
