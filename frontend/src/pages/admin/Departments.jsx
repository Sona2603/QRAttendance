import { useState, useEffect, useCallback } from 'react'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments'
import { Table, Pagination } from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import SearchInput from '../../components/common/SearchInput'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { usePagination } from '../../hooks/usePagination'
import toast from 'react-hot-toast'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'

export default function Departments() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const { page, setPage, totalPages, handleResponse } = usePagination()

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getDepartments({ search, page })
      setDepartments(data.results || data)
      handleResponse(data)
    } finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { fetch() }, [fetch])

  const openCreate = () => { setForm({ name: '', description: '' }); setModal({ open: true, editing: null }) }
  const openEdit = (d) => { setForm({ name: d.name, description: d.description }); setModal({ open: true, editing: d }) }
  const closeModal = () => setModal({ open: false, editing: null })

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal.editing) await updateDepartment(modal.editing.id, form)
      else await createDepartment(form)
      toast.success(modal.editing ? 'Department updated' : 'Department created')
      closeModal(); fetch()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (d) => {
    if (!confirm(`Delete "${d.name}"?`)) return
    try { await deleteDepartment(d.id); toast.success('Deleted'); fetch() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'student_count', label: 'Students' },
    { key: 'teacher_count', label: 'Teachers' },
    { key: 'created_at', label: 'Created', render: (r) => formatDate(r.created_at) },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" aria-label="Edit"><HiPencil /></button>
        <button onClick={() => handleDelete(r)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" aria-label="Delete"><HiTrash /></button>
      </div>
    )},
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Departments</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><HiPlus />Add Department</button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search departments..." />
      <Table columns={columns} data={departments} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modal.open} onClose={closeModal} title={modal.editing ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
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
