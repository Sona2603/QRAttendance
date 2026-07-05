import { useState, useEffect } from 'react'
import { getMonthly } from '../../api/attendance'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function TeacherReports() {
  const [monthly, setMonthly] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    getMonthly(year).then(r => setMonthly(r.data)).catch(() => {})
  }, [year])

  const data = monthly.map(m => ({ name: MONTHS[m.month - 1], count: m.count }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports</h1>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field w-32">
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Monthly Attendance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
