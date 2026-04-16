import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'TechSalary LK — Sri Lanka Tech Salary Transparency',
  description: 'Anonymous tech salary data for Sri Lanka.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen bg-gray-50">{children}</main>
        <footer className="bg-white border-t border-gray-200 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>TechSalary LK — Community-driven salary transparency for Sri Lanka</p>
            <p className="mt-1">All submissions are anonymous. No personal data is linked to salary records.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
