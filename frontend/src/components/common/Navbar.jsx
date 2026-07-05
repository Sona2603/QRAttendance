import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiMenu, HiMoon, HiSun, HiUser, HiLogout, HiCog, HiChevronDown } from 'react-icons/hi'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const ROLE_COLORS = {
  ADMIN: 'bg-purple-500',
  TEACHER: 'bg-blue-500',
  STUDENT: 'bg-green-500',
}

export default function Navbar({ onMenuClick }) {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleProfile = () => {
    setOpen(false)
    const base = user?.role === 'ADMIN' ? '/admin' : user?.role === 'TEACHER' ? '/teacher' : '/student'
    navigate(`${base}/profile`)
  }

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  const avatarColor = ROLE_COLORS[user?.role] || 'bg-blue-500'

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Open menu"
      >
        <HiMenu className="text-xl text-gray-600 dark:text-gray-300" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label="Toggle dark mode"
        >
          {dark ? <HiSun className="text-xl" /> : <HiMoon className="text-xl" />}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Profile menu"
            aria-expanded={open}
          >
            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{user?.role}</p>
            </div>
            <HiChevronDown className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown panel */}
          {open && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium
                    ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      user?.role === 'TEACHER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Department row */}
              {user?.department_name && (
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-400 dark:text-gray-500">Department</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{user.department_name}</p>
                </div>
              )}

              {/* Actions */}
              <div className="p-1.5">
                <button
                  onClick={handleProfile}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <HiUser className="text-gray-400 flex-shrink-0" />
                  View Profile
                </button>
              </div>

              <div className="p-1.5 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <HiLogout className="flex-shrink-0" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
