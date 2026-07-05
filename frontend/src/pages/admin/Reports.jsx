import { useState, useEffect } from 'react'
import { getMonthly, getDeptStats } from '../../api/attendance'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export default function Reports() {
  const [monthly, setMonthly] = useState([])
  const [deptStats, setDeptStats] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    getMonthly(year).then(r => setMonthly(r.data)).catch(() => {})
    getDeptStats().then(r => setDeptStats(r.data)).catch(() => {})
  }, [year])

  const monthlyData = monthly.map(m => ({ name: MONTHS[m.month - 1], count: m.count }))
  const years = [2023, 2024, 2025, 2026]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field w-32">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Monthly Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Monthly Attendance Bar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Department-wise Attendance</h2>
          {deptStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-center py-16">No data</p>}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Present vs Absent</h2>
          {deptStats.length > 0 ? (() => {
            const present = deptStats.reduce((s, d) => s + d.present, 0)
            const absent = deptStats.reduce((s, d) => s + d.absent, 0)
            const pieData = [{ name: 'Present', value: present }, { name: 'Absent', value: absent }]
            return (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((_, i) => <Cell key={i} fill={['#10b981', '#ef4444'][i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )
          })() : <p className="text-gray-400 text-center py-16">No data</p>}
        </div>
      </div>
    </div>
  )
}
