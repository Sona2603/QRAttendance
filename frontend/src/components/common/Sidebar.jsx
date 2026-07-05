import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HiHome, HiUsers, HiAcademicCap, HiOfficeBuilding,
  HiQrcode, HiClipboardList, HiChartBar, HiLogout
} from 'react-icons/hi'

const adminLinks = [
  { to: '/admin', icon: HiHome, label: 'Dashboard' },
  { to: '/admin/users', icon: HiUsers, label: 'Users' },
  { to: '/admin/departments', icon: HiOfficeBuilding, label: 'Departments' },
  { to: '/admin/classrooms', icon: HiAcademicCap, label: 'Classrooms' },
  { to: '/admin/sessions', icon: HiQrcode, label: 'Sessions' },
  { to: '/admin/attendance', icon: HiClipboardList, label: 'Attendance' },
  { to: '/admin/reports', icon: HiChartBar, label: 'Reports' },
]

const teacherLinks = [
  { to: '/teacher', icon: HiHome, label: 'Dashboard' },
  { to: '/teacher/sessions', icon: HiQrcode, label: 'Sessions' },
  { to: '/teacher/attendance', icon: HiClipboardList, label: 'Attendance' },
  { to: '/teacher/reports', icon: HiChartBar, label: 'Reports' },
]

const studentLinks = [
  { to: '/student', icon: HiHome, label: 'Dashboard' },
  { to: '/student/scan', icon: HiQrcode, label: 'Scan QR' },
  { to: '/student/history', icon: HiClipboardList, label: 'My Attendance' },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin, isTeacher } = useAuth()
  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : studentLinks

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-30
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <HiQrcode className="text-blue-600 text-2xl" />
          <span className="font-bold text-lg text-gray-800 dark:text-white">QR Attendance</span>
        </div>

        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
        </div>

        <nav className="p-4 flex flex-col gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length === 2}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon className="text-lg flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <HiLogout className="text-lg" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
