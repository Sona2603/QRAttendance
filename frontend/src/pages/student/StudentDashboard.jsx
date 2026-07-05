import { useState, useEffect } from 'react'
import { getHistory } from '../../api/attendance'
import StatCard from '../../components/common/StatCard'
import { HiClipboardList, HiChartBar, HiQrcode } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState({ total: 0, percentage: 0 })

  useEffect(() => {
    getHistory().then(r => setData(r.data)).catch(() => {})
  }, [])

  const present = data.attendances?.filter(a => a.status === 'PRESENT').length || 0
  const late = data.attendances?.filter(a => a.status === 'LATE').length || 0
  const absent = data.attendances?.filter(a => a.status === 'ABSENT').length || 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sessions" value={data.total} icon={HiClipboardList} color="blue" />
        <StatCard title="Attendance %" value={`${data.percentage}%`} icon={HiChartBar} color="green" />
        <StatCard title="Present" value={present} icon={HiClipboardList} color="green" />
        <StatCard title="Late" value={late} icon={HiClipboardList} color="orange" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/student/scan')} className="btn-primary flex items-center gap-2">
            <HiQrcode /> Scan QR Code
          </button>
          <button onClick={() => navigate('/student/history')} className="btn-secondary flex items-center gap-2">
            <HiClipboardList /> View History
          </button>
        </div>
      </div>

      {/* Attendance bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance Rate</span>
          <span className="text-sm font-bold text-gray-800 dark:text-white">{data.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${data.percentage >= 75 ? 'bg-green-500' : data.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${data.percentage}%` }}
          />
        </div>
        <p className={`text-xs mt-2 ${data.percentage >= 75 ? 'text-green-600' : 'text-red-500'}`}>
          {data.percentage >= 75 ? 'Good attendance!' : 'Attendance below 75% — please attend more classes.'}
        </p>
      </div>
    </div>
  )
}
