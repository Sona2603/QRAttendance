import { useState, useEffect } from 'react'
import { getStats, getMonthly, getDeptStats } from '../../api/attendance'
import StatCard from '../../components/common/StatCard'
import { HiUsers, HiAcademicCap, HiOfficeBuilding, HiClipboardList, HiStatusOnline } from 'react-icons/hi'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [deptStats, setDeptStats] = useState([])

  useEffect(() => {
    getStats().then(r => setStats(r.data)).catch(() => {})
    getMonthly(new Date().getFullYear()).then(r => setMonthly(r.data)).catch(() => {})
    getDeptStats().then(r => setDeptStats(r.data)).catch(() => {})
  }, [])

  const monthlyData = monthly.map(m => ({ name: MONTHS[m.month - 1], count: m.count }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={stats?.total_students} icon={HiUsers} color="blue" />
        <StatCard title="Total Teachers" value={stats?.total_teachers} icon={HiUsers} color="green" />
        <StatCard title="Total Classes" value={stats?.total_classes} icon={HiAcademicCap} color="purple" />
        <StatCard title="Departments" value={stats?.total_departments} icon={HiOfficeBuilding} color="orange" />
        <StatCard title="Total Sessions" value={stats?.total_sessions} icon={HiClipboardList} color="blue" />
        <StatCard title="Active Sessions" value={stats?.active_sessions} icon={HiStatusOnline} color="green" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Monthly Attendance</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Department Statistics</h2>
          {deptStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deptStats} dataKey="total" nameKey="department" cx="50%" cy="50%" outerRadius={100} label>
                  {deptStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No data yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
