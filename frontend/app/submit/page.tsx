'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  country: string
  company: string
  role: string
  level: string
  yearsOfExperience: string
  salary: string
  currency: string
  bonus: string
  stockOptions: string
  workModel: string
  location: string
}

export default function SubmitSalary() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    country: '',
    company: '',
    role: '',
    level: '',
    yearsOfExperience: '',
    salary: '',
    currency: 'USD',
    bonus: '',
    stockOptions: '',
    workModel: '',
    location: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.company.trim()) newErrors.company = 'Company is required'
    if (!formData.role.trim()) newErrors.role = 'Role is required'
    if (!formData.level.trim()) newErrors.level = 'Level is required'
    if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = 'Years of experience is required'
    if (!formData.salary.trim() || isNaN(Number(formData.salary))) newErrors.salary = 'Valid salary is required'
    if (!formData.workModel.trim()) newErrors.workModel = 'Work model is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/salaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary),
          bonus: formData.bonus ? Number(formData.bonus) : 0,
          stockOptions: formData.stockOptions ? Number(formData.stockOptions) : 0,
          yearsOfExperience: Number(formData.yearsOfExperience)
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          country: '',
          company: '',
          role: '',
          level: '',
          yearsOfExperience: '',
          salary: '',
          currency: 'USD',
          bonus: '',
          stockOptions: '',
          workModel: '',
          location: ''
        })
      } else {
        setErrors({ general: 'Failed to submit salary. Please try again.' })
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-gray-600/15 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15"></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full">
            <div className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Salary Submitted Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Your anonymous salary submission has been received. It will be reviewed by the community and will appear in search results once approved.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold"
                >
                  Submit Another Salary
                </button>
                <button
                  onClick={() => router.push('/search')}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                >
                  Browse Salaries
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/15 to-gray-600/15 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen py-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-2xl">
              Submit Salary Information
            </h1>
            <p className="text-lg text-gray-200 font-light leading-relaxed max-w-2xl mx-auto">
              Help the community by sharing anonymous salary data. Your submission will be reviewed and approved by community members.
            </p>
          </div>

          <form className="bg-white/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-8" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.country ? 'border-red-400 bg-red-50' : ''}`}
                >
                  <option value="">Select Country</option>
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
                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.company ? 'border-red-400 bg-red-50' : ''}`}
                  placeholder="e.g., Google, Microsoft"
                />
                {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.role ? 'border-red-400 bg-red-50' : ''}`}
                  placeholder="e.g., Software Engineer, Product Manager"
                />
                {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.level ? 'border-red-400 bg-red-50' : ''}`}
                >
                  <option value="">Select Level</option>
                  <option value="Junior">Junior (0-2 years)</option>
                  <option value="Mid">Mid (3-5 years)</option>
                  <option value="Senior">Senior (6-10 years)</option>
                  <option value="Lead">Lead (10+ years)</option>
                  <option value="Principal">Principal</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                </select>
                {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.yearsOfExperience ? 'border-red-400 bg-red-50' : ''}`}
                  placeholder="e.g., 3"
                  min="0"
                  max="50"
                />
                {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>}
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-semibold text-gray-700 mb-2">
                  Annual Salary *
                </label>
                <div className="flex gap-2">
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                    <option value="LKR">LKR</option>
                    <option value="INR">INR</option>
                    <option value="SGD">SGD</option>
                    <option value="JPY">JPY</option>
                  </select>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.salary ? 'border-red-400 bg-red-50' : ''}`}
                    placeholder="e.g., 85000"
                  />
                </div>
                {errors.salary && <p className="mt-1 text-sm text-red-600">{errors.salary}</p>}
              </div>

              <div>
                <label htmlFor="bonus" className="block text-sm font-semibold text-gray-700 mb-2">
                  Annual Bonus (Optional)
                </label>
                <input
                  type="text"
                  id="bonus"
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                  placeholder="e.g., 10000"
                />
              </div>

              <div>
                <label htmlFor="stockOptions" className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Options (Optional)
                </label>
                <input
                  type="text"
                  id="stockOptions"
                  name="stockOptions"
                  value={formData.stockOptions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
                  placeholder="e.g., 50000"
                />
              </div>

              <div>
                <label htmlFor="workModel" className="block text-sm font-semibold text-gray-700 mb-2">
                  Work Model *
                </label>
                <select
                  id="workModel"
                  name="workModel"
                  value={formData.workModel}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.workModel ? 'border-red-400 bg-red-50' : ''}`}
                >
                  <option value="">Select Work Model</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                {errors.workModel && <p className="mt-1 text-sm text-red-600">{errors.workModel}</p>}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Work Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 ${errors.location ? 'border-red-400 bg-red-50' : ''}`}
                  placeholder="e.g., San Francisco, London, Colombo"
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Salary Anonymously'
                )}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Your submission will be completely anonymous. No personal information is stored with salary data.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
