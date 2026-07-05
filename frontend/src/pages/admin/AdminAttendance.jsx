import { useState, useEffect, useCallback } from 'react'
import { getAttendance, exportCSV, exportExcel } from '../../api/attendance'
import { getDepartments } from '../../api/departments'
import { getClassrooms } from '../../api/classrooms'
import { Table, Pagination } from '../../components/common/Table'
import SearchInput from '../../components/common/SearchInput'
import { formatDateTime, downloadBlob, getErrorMessage } from '../../utils/helpers'
import { usePagination } from '../../hooks/usePagination'
import toast from 'react-hot-toast'
import { HiDownload } from 'react-icons/hi'

export default function AdminAttendance() {
  const [records, setRecords] = useState([])
  const [departments, setDepartments] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ department: '', classroom: '', status: '', date_from: '', date_to: '' })
  const { page, setPage, totalPages, handleResponse } = usePagination()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = { search, page, ...filters }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const { data } = await getAttendance(params)
      setRecords(data.results || data)
      handleResponse(data)
    } finally { setLoading(false) }
  }, [search, page, filters])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    getDepartments().then(r => setDepartments(r.data.results || r.data)).catch(() => {})
    getClassrooms().then(r => setClassrooms(r.data.results || r.data)).catch(() => {})
  }, [])

  const handleExport = async (type) => {
    try {
      const params = { ...filters }
      Object.keys(params).forEach(k => !params[k] && delete params[k])
      const fn = type === 'csv' ? exportCSV : exportExcel
      const { data } = await fn(params)
      downloadBlob(data, `attendance.${type === 'csv' ? 'csv' : 'xlsx'}`)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const setFilter = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))

  const statusBadge = (status) => {
    if (status === 'PRESENT') return <span className="badge-present">Present</span>
    if (status === 'ABSENT') return <span className="badge-absent">Absent</span>
    return <span className="badge-late">Late</span>
  }

  const columns = [
    { key: 'student_name', label: 'Student' },
    { key: 'student_email', label: 'Email' },
    { key: 'session_classroom', label: 'Classroom' },
    { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
    { key: 'scan_time', label: 'Scan Time', render: r => formatDateTime(r.scan_time) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Records</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-1 text-sm"><HiDownload />CSV</button>
          <button onClick={() => handleExport('excel')} className="btn-secondary flex items-center gap-1 text-sm"><HiDownload />Excel</button>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search student..." />
          <select value={filters.department} onChange={setFilter('department')} className="input-field">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filters.status} onChange={setFilter('status')} className="input-field">
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
          </select>
          <input type="date" value={filters.date_from} onChange={setFilter('date_from')} className="input-field" placeholder="From date" />
          <input type="date" value={filters.date_to} onChange={setFilter('date_to')} className="input-field" placeholder="To date" />
        </div>
      </div>

      <Table columns={columns} data={records} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
