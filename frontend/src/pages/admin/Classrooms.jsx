import { useState, useEffect, useCallback } from 'react'
import { getClassrooms, createClassroom, updateClassroom, deleteClassroom } from '../../api/classrooms'
import { getDepartments } from '../../api/departments'
import { getUsers } from '../../api/auth'
import { Table, Pagination } from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import SearchInput from '../../components/common/SearchInput'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { usePagination } from '../../hooks/usePagination'
import toast from 'react-hot-toast'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([])
  const [departments, setDepartments] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })
  const [form, setForm] = useState({ name: '', department: '', teacher: '' })
  const [saving, setSaving] = useState(false)
  const { page, setPage, totalPages, handleResponse } = usePagination()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getClassrooms({ search, page })
      setClassrooms(data.results || data)
      handleResponse(data)
    } finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    getDepartments().then(r => setDepartments(r.data.results || r.data)).catch(() => {})
    getUsers({ role: 'TEACHER' }).then(r => setTeachers(r.data.results || r.data)).catch(() => {})
  }, [])

  const openCreate = () => { setForm({ name: '', department: '', teacher: '' }); setModal({ open: true, editing: null }) }
  const openEdit = (c) => { setForm({ name: c.name, department: c.department, teacher: c.teacher || '' }); setModal({ open: true, editing: c }) }
  const closeModal = () => setModal({ open: false, editing: null })

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.teacher) delete payload.teacher
      if (modal.editing) await updateClassroom(modal.editing.id, payload)
      else await createClassroom(payload)
      toast.success(modal.editing ? 'Updated' : 'Created')
      closeModal(); fetch()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return
    try { await deleteClassroom(c.id); toast.success('Deleted'); fetch() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'department_name', label: 'Department' },
    { key: 'teacher_name', label: 'Teacher' },
    { key: 'student_count', label: 'Students' },
    { key: 'created_at', label: 'Created', render: r => formatDate(r.created_at) },
    { key: 'actions', label: 'Actions', render: r => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" aria-label="Edit"><HiPencil /></button>
        <button onClick={() => handleDelete(r)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" aria-label="Delete"><HiTrash /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Classrooms</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><HiPlus />Add Classroom</button>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search classrooms..." />
      <Table columns={columns} data={classrooms} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modal.open} onClose={closeModal} title={modal.editing ? 'Edit Classroom' : 'Add Classroom'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input required value={form.name} onChange={set('name')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <select required value={form.department} onChange={set('department')} className="input-field">
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher</label>
            <select value={form.teacher} onChange={set('teacher')} className="input-field">
              <option value="">None</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
