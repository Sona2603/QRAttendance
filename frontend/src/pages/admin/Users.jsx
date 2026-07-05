import { useState, useEffect, useCallback } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../../api/auth'
import { getDepartments } from '../../api/departments'
import { Table, Pagination } from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import SearchInput from '../../components/common/SearchInput'
import { formatDate, getErrorMessage } from '../../utils/helpers'
import { usePagination } from '../../hooks/usePagination'
import toast from 'react-hot-toast'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT']
const emptyForm = { name: '', email: '', password: '', role: 'STUDENT', department: '' }

export default function Users() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [modal, setModal] = useState({ open: false, editing: null })
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { page, setPage, totalPages, handleResponse } = usePagination()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getUsers({ search, role: roleFilter, page })
      setUsers(data.results || data)
      handleResponse(data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [search, roleFilter, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { getDepartments().then(r => setDepartments(r.data.results || r.data)).catch(() => {}) }, [])

  const openCreate = () => { setForm(emptyForm); setModal({ open: true, editing: null }) }
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: '', role: u.role, department: u.department || '' }); setModal({ open: true, editing: u }) }
  const closeModal = () => setModal({ open: false, editing: null })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (modal.editing) await updateUser(modal.editing.id, payload)
      else await createUser(payload)
      toast.success(modal.editing ? 'User updated' : 'User created')
      closeModal(); fetchUsers()
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const handleDelete = async (u) => {
    if (!confirm(`Delete ${u.name}?`)) return
    try { await deleteUser(u.id); toast.success('User deleted'); fetchUsers() }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
        ${r.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
          r.role === 'TEACHER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
        {r.role}
      </span>
    )},
    { key: 'department_name', label: 'Department' },
    { key: 'created_at', label: 'Joined', render: (r) => formatDate(r.created_at) },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" aria-label="Edit"><HiPencil /></button>
        <button onClick={() => handleDelete(r)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" aria-label="Delete"><HiTrash /></button>
      </div>
    )},
  ]

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Users</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><HiPlus />Add User</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." /></div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field sm:w-40">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <Table columns={columns} data={users} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modal.open} onClose={closeModal} title={modal.editing ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input required value={form.name} onChange={set('name')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={set('email')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password {modal.editing && '(leave blank to keep)'}</label>
            <input type="password" minLength={modal.editing ? 0 : 8} value={form.password} onChange={set('password')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select value={form.role} onChange={set('role')} className="input-field">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <select value={form.department} onChange={set('department')} className="input-field">
              <option value="">None</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
