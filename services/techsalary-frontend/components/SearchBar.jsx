'use client'

import { useState } from 'react'

const ROLES = [
  'Software Engineer','Senior Software Engineer','Frontend Developer',
  'Backend Developer','Full Stack Developer','DevOps Engineer',
  'Data Engineer','Data Scientist','ML Engineer','Product Manager','QA Engineer',
]
const LEVELS = ['Junior','Mid','Senior','Lead','Principal','Manager','Director']
const LOCATIONS = ['Colombo','Kandy','Galle','Negombo','Remote (Sri Lanka)','Remote (Global)']

const EMPTY = { role: '', company: '', level: '', location: '' }

export default function SearchBar({ onSearch, loading }) {
  const [f, setF] = useState(EMPTY)
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const reset = () => { setF(EMPTY); onSearch(EMPTY) }

  return (
    <div className="card">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select value={f.role} onChange={e => set('role', e.target.value)} className="input-field">
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input type="text" placeholder="Company" value={f.company}
          onChange={e => set('company', e.target.value)} className="input-field" />
        <select value={f.level} onChange={e => set('level', e.target.value)} className="input-field">
          <option value="">All levels</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={f.location} onChange={e => set('location', e.target.value)} className="input-field">
          <option value="">All locations</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onSearch(f)} disabled={loading} className="btn-primary text-sm flex-1">
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button onClick={reset} className="btn-secondary text-sm px-5">Reset</button>
      </div>
    </div>
  )
}
