import { useState, useEffect, useCallback, useRef } from 'react'
import { getSessions, createSession, updateSession, deleteSession } from '../../api/attendance'
import { getClassrooms } from '../../api/classrooms'
import { Table, Pagination } from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import { formatDateTime, getErrorMessage } from '../../utils/helpers'
import { usePagination } from '../../hooks/usePagination'
import toast from 'react-hot-toast'
import { HiPlus, HiQrcode, HiTrash, HiRefresh } from 'react-icons/hi'

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [qrModal, setQrModal] = useState({ open: false, session: null })
  const [form, setForm] = useState({ classroom: '', end_time: '' })
  const [saving, setSaving] = useState(false)
  const { page, setPage, totalPages, handleResponse } = usePagination()
  const refreshTimer = useRef(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getSessions({ page })
      setSessions(data.results || data)
      handleResponse(data)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    getClassrooms().then(r => setClassrooms(r.data.results || r.data)).catch(() => {})
  }, [])

  // Auto-refresh QR every 30 seconds when modal is open
  useEffect(() => {
    if (qrModal.open && qrModal.session) {
      refreshTimer.current = setInterval(() => {
        getSessions({ page: 1 }).then(r => {
          const sessions = r.data.results || r.data
          const updated = sessions.find(s => s.id === qrModal.session.id)
          if (updated) setQrModal(m => ({ ...m, session: updated }))
        }).catch(() => {})
      }, 30000)
    }
    return () => clearInterval(refreshTimer.current)
  }, [qrModal.open, qrModal.session?.id])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const { data } = await createSession(form)
      toast.success('Session created!')
      setCreateModal(false)
      fetch()
      setQrModal({ open: true, session: data })
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const toggleActive = async (s) => {
    try {
      await updateSession(s.id, { is_active: !s.is_active })
      toast.success(s.is_active ? 'Session deactivated' : 'Session activated')
      fetch()
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const handleDelete = async (s) => {
    if (!confirm('Delete this session?')) return
    try { await deleteSession(s.id); toast.success('Deleted'); fetch() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const columns = [
    { key: 'classroom_name', label: 'Classroom' },
    { key: 'start_time', label: 'Start', render: r => formatDateTime(r.start_time) },
    { key: 'end_time', label: 'End', render: r => formatDateTime(r.end_time) },
    { key: 'attendance_count', label: 'Attendees' },
    { key: 'is_active', label: 'Status', render: r => (
      r.is_expired
        ? <span className="badge-absent">Expired</span>
        : r.is_active
          ? <span className="badge-present">Active</span>
          : <span className="badge-late">Inactive</span>
    )},
    { key: 'actions', label: 'Actions', render: r => (
      <div className="flex gap-2">
        <button onClick={() => setQrModal({ open: true, session: r })}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" aria-label="View QR">
          <HiQrcode />
        </button>
        <button onClick={() => toggleActive(r)}
          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded" aria-label="Toggle">
          <HiRefresh />
        </button>
        <button onClick={() => handleDelete(r)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded" aria-label="Delete">
          <HiTrash />
        </button>
      </div>
    )},
  ]

  const defaultEnd = () => {
    const d = new Date(); d.setHours(d.getHours() + 1)
    return d.toISOString().slice(0, 16)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Sessions</h1>
        <button onClick={() => { setForm({ classroom: '', end_time: defaultEnd() }); setCreateModal(true) }}
          className="btn-primary flex items-center gap-2">
          <HiPlus />New Session
        </button>
      </div>

      <Table columns={columns} data={sessions} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create Session Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Attendance Session">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Classroom</label>
            <select required value={form.classroom} onChange={set('classroom')} className="input-field">
              <option value="">Select classroom</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session End Time</label>
            <input type="datetime-local" required value={form.end_time} onChange={set('end_time')} className="input-field" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating...' : 'Create & Get QR'}</button>
          </div>
        </form>
      </Modal>

      {/* QR Display Modal */}
      <Modal open={qrModal.open} onClose={() => setQrModal({ open: false, session: null })} title="QR Code" size="sm">
        {qrModal.session && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{qrModal.session.classroom_name}</p>
            <p className="text-xs text-gray-500">Expires: {formatDateTime(qrModal.session.end_time)}</p>
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${qrModal.session.qr_code}`}
                alt="QR Code"
                className="w-64 h-64 border-4 border-white shadow-lg rounded-lg"
              />
            </div>
            <p className="text-xs text-gray-400">QR auto-refreshes every 30 seconds</p>
            {qrModal.session.is_expired && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-2 rounded-lg text-sm">
                This session has expired
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
