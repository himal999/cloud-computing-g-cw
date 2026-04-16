'use client'

import { useState } from 'react'
import { submitSalary } from '@/lib/api'

const ROLES = [
  'Software Engineer','Senior Software Engineer','Lead Engineer',
  'Frontend Developer','Backend Developer','Full Stack Developer',
  'DevOps Engineer','Data Engineer','Data Scientist','ML Engineer',
  'Product Manager','UI/UX Designer','QA Engineer','System Architect',
  'Engineering Manager','CTO','Other',
]
const LEVELS    = ['Junior','Mid','Senior','Lead','Principal','Manager','Director','C-Level']
const LOCATIONS = ['Colombo','Kandy','Galle','Negombo','Remote (Sri Lanka)','Remote (Global)','Other']
const CURRENCIES = ['LKR','USD','GBP','EUR','AUD']

const EMPTY = {
  role:'', company:'', level:'', location:'',
  salary_amount:'', currency:'LKR',
  years_of_experience:'', tech_stack:'', anonymize: true,
}

export default function SubmitPage() {
  const [form, setForm]           = useState(EMPTY)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState(null)
  const [fieldErrors, setFE]      = useState({})

  const validate = () => {
    const e = {}
    if (!form.role)   e.role = 'Role is required'
    if (!form.level)  e.level = 'Level is required'
    if (!form.location) e.location = 'Location is required'
    if (!form.salary_amount || isNaN(form.salary_amount) || Number(form.salary_amount) <= 0)
      e.salary_amount = 'Enter a valid salary amount'
    if (form.years_of_experience === '' || isNaN(form.years_of_experience) || Number(form.years_of_experience) < 0)
      e.years_of_experience = 'Enter valid years of experience'
    return e
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setFE(p => ({ ...p, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFE(errs); return }
    setLoading(true); setError(null)
    try {
      await submitSalary({
        ...form,
        salary_amount: Number(form.salary_amount),
        years_of_experience: Number(form.years_of_experience),
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Salary Submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your entry is pending community review. Once it receives enough upvotes it will appear in search results.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/" className="btn-secondary text-sm">Browse Salaries</a>
            <button onClick={() => setSuccess(false)} className="btn-primary text-sm">Submit Another</button>
          </div>
        </div>
      </div>
    )
  }

  const field = (label, name, required, children) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {fieldErrors[name] && <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit Your Salary</h1>
        <p className="text-gray-500 text-sm mt-1">No login required. Your identity is never linked to your submission.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div className="sm:col-span-2">
              {field('Role', 'role', true,
                <select name="role" value={form.role} onChange={handleChange} className="input-field">
                  <option value="">Select a role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </div>

            <div className="sm:col-span-2">
              {field('Company', 'company', false,
                <input type="text" name="company" value={form.company} onChange={handleChange}
                  placeholder="e.g. WSO2, IFS, Dialog" className="input-field" />
              )}
            </div>

            {field('Level', 'level', true,
              <select name="level" value={form.level} onChange={handleChange} className="input-field">
                <option value="">Select level</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            )}

            {field('Location', 'location', true,
              <select name="location" value={form.location} onChange={handleChange} className="input-field">
                <option value="">Select location</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            )}

            {field('Monthly Salary', 'salary_amount', true,
              <input type="number" name="salary_amount" value={form.salary_amount} onChange={handleChange}
                placeholder="e.g. 150000" min="0" className="input-field" />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="input-field">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {field('Years of Experience', 'years_of_experience', true,
              <input type="number" name="years_of_experience" value={form.years_of_experience}
                onChange={handleChange} placeholder="e.g. 3" min="0" max="50" className="input-field" />
            )}

            {field('Tech Stack (optional)', 'tech_stack', false,
              <input type="text" name="tech_stack" value={form.tech_stack} onChange={handleChange}
                placeholder="e.g. React, Node.js, AWS" className="input-field" />
            )}

            <div className="sm:col-span-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="anonymize" checked={form.anonymize} onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                <div>
                  <span className="text-sm font-medium text-gray-700">Anonymize company name</span>
                  <p className="text-xs text-gray-500 mt-0.5">Company name will be hidden from public view.</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs text-gray-400">Reviewed by community before going public.</p>
            <button type="submit" disabled={loading} className="btn-primary shrink-0">
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                : 'Submit Salary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
