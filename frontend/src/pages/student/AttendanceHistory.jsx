import { useState, useEffect } from 'react'
import { getHistory } from '../../api/attendance'
import { formatDateTime } from '../../utils/helpers'
import { HiRefresh } from 'react-icons/hi'

export default function AttendanceHistory() {
  const [data, setData] = useState({ attendances: [], total: 0, percentage: 0 })
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    setLoading(true)
    try { const { data: d } = await getHistory(); setData(d) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const statusBadge = (s) => {
    if (s === 'PRESENT') return <span className="badge-present">Present</span>
    if (s === 'ABSENT') return <span className="badge-absent">Absent</span>
    return <span className="badge-late">Late</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance History</h1>
        <button onClick={fetch} className="btn-secondary flex items-center gap-1 text-sm" aria-label="Refresh">
          <HiRefresh />Refresh
        </button>
      </div>

      {/* Summary card */}
      <div className="card">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{data.total}</p>
            <p className="text-sm text-gray-500">Total Sessions</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">{data.attendances?.filter(a => a.status === 'PRESENT').length || 0}</p>
            <p className="text-sm text-gray-500">Present</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-600">{data.attendances?.filter(a => a.status === 'LATE').length || 0}</p>
            <p className="text-sm text-gray-500">Late</p>
          </div>
          <div>
            <p className={`text-3xl font-bold ${data.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>{data.percentage}%</p>
            <p className="text-sm text-gray-500">Attendance</p>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${data.percentage >= 75 ? 'bg-green-500' : data.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${data.percentage}%` }}
          />
        </div>
      </div>

      {/* Records */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}
        </div>
      ) : data.attendances?.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">No attendance records yet.</div>
      ) : (
        <div className="space-y-2">
          {data.attendances?.map(a => (
            <div key={a.id} className="card flex items-center justify-between py-3 px-4">
              <div>
                <p className="font-medium text-gray-800 dark:text-white text-sm">{a.session_classroom}</p>
                <p className="text-xs text-gray-500">{formatDateTime(a.scan_time)}</p>
              </div>
              {statusBadge(a.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
