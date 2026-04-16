'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('token'))
  }, [pathname])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setLoggedIn(false)
    window.location.href = '/'
  }

  const navLink = (href, label) => (
    <Link href={href} className={"text-sm px-3 py-2 rounded-lg transition-colors " +
      (pathname === href
        ? 'bg-brand-50 text-brand-700 font-medium'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}>
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-brand-700 text-lg tracking-tight">
          TechSalary LK
        </Link>
        <div className="flex items-center gap-1">
          {navLink('/', 'Browse')}
          {navLink('/submit', 'Submit')}
          {navLink('/stats', 'Stats')}
          {loggedIn && navLink('/pending', 'Review')}
          {loggedIn
            ? <button onClick={logout} className="btn-secondary text-sm ml-2">Logout</button>
            : <Link href="/login" className="btn-primary text-sm ml-2">Login</Link>
          }
        </div>
      </div>
    </nav>
  )
}