import { useState, useEffect, useCallback } from 'react'
import { getAttendance, exportCSV, exportExcel } from '../../api/attendance'
import { Table, Pagination } from '../../components/common/Table'
import SearchInput from '../../components/common/SearchInput'
import { formatDateTime, downloadBlob, getErrorMessage } from '../../utils/helpers'
import { usePagination } from '../../hooks/usePagination'
import toast from 'react-hot-toast'
import { HiDownload } from 'react-icons/hi'

export default function TeacherAttendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { page, setPage, totalPages, handleResponse } = usePagination()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = { search, page }
      if (statusFilter) params.status = statusFilter
      const { data } = await getAttendance(params)
      setRecords(data.results || data)
      handleResponse(data)
    } finally { setLoading(false) }
  }, [search, page, statusFilter])

  useEffect(() => { fetch() }, [fetch])

  const handleExport = async (type) => {
    try {
      const fn = type === 'csv' ? exportCSV : exportExcel
      const { data } = await fn()
      downloadBlob(data, `attendance.${type}`)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const statusBadge = (s) => {
    if (s === 'PRESENT') return <span className="badge-present">Present</span>
    if (s === 'ABSENT') return <span className="badge-absent">Absent</span>
    return <span className="badge-late">Late</span>
  }

  const columns = [
    { key: 'student_name', label: 'Student' },
    { key: 'session_classroom', label: 'Classroom' },
    { key: 'status', label: 'Status', render: r => statusBadge(r.status) },
    { key: 'scan_time', label: 'Scan Time', render: r => formatDateTime(r.scan_time) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-1 text-sm"><HiDownload />CSV</button>
          <button onClick={() => handleExport('excel')} className="btn-secondary flex items-center gap-1 text-sm"><HiDownload />Excel</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search student..." /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-40">
          <option value="">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="LATE">Late</option>
          <option value="ABSENT">Absent</option>
        </select>
      </div>

      <Table columns={columns} data={records} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
