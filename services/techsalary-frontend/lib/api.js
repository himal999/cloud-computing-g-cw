const BFF = process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:5000'

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await fetch(`${BFF}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed')
  return data
}

export const searchSalaries = (filters) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v) })
  return request('/api/search?' + params.toString())
}

export const submitSalary = (body) =>
  request('/api/salary', { method: 'POST', body: JSON.stringify(body) })

export const getStats = (filters = {}) => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v) })
  return request('/api/stats?' + params.toString())
}

export const login  = (body) => request('/api/auth/login',    { method: 'POST', body: JSON.stringify(body) })
export const signup = (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) })

export const vote = (id, type) =>
  request(`/api/vote/${id}`, { method: 'POST', body: JSON.stringify({ vote_type: type }) })
