import { useState, useEffect } from 'react'
import { getSessions } from '../../api/attendance'
import { getClassrooms } from '../../api/classrooms'
import StatCard from '../../components/common/StatCard'
import { HiQrcode, HiAcademicCap, HiClipboardList, HiStatusOnline } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ sessions: 0, active: 0, classes: 0 })

  useEffect(() => {
    Promise.all([getSessions(), getClassrooms()]).then(([s, c]) => {
      const sessions = s.data.results || s.data
      const classes = c.data.results || c.data
      setStats({
        sessions: sessions.length,
        active: sessions.filter(s => s.is_active && !s.is_expired).length,
        classes: classes.length,
      })
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Classes" value={stats.classes} icon={HiAcademicCap} color="blue" />
        <StatCard title="Total Sessions" value={stats.sessions} icon={HiClipboardList} color="purple" />
        <StatCard title="Active Sessions" value={stats.active} icon={HiStatusOnline} color="green" />
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/teacher/sessions')} className="btn-primary flex items-center gap-2">
            <HiQrcode /> Create Session & Generate QR
          </button>
          <button onClick={() => navigate('/teacher/attendance')} className="btn-secondary flex items-center gap-2">
            <HiClipboardList /> View Attendance
          </button>
        </div>
      </div>
    </div>
  )
}
