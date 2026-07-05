import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword } from '../api/auth'
import { getDepartments } from '../api/departments'
import { getErrorMessage, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { HiUser, HiMail, HiOfficeBuilding, HiCalendar, HiLockClosed } from 'react-icons/hi'
import { useEffect } from 'react'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [departments, setDepartments] = useState([])
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', department: user?.department || '' })
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    getDepartments().then(r => setDepartments(r.data.results || r.data)).catch(() => {})
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const payload = { name: profileForm.name }
      if (profileForm.department) payload.department = profileForm.department
      const { data } = await updateProfile(payload)
      setUser(data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    setSavingPw(true)
    try {
      await changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password })
      toast.success('Password changed successfully')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSavingPw(false)
    }
  }

  const ROLE_STYLE = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    TEACHER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    STUDENT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Profile</h1>

      {/* Info card */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{user?.name}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><HiMail />{user?.email}</span>
            {user?.department_name && (
              <span className="flex items-center gap-1"><HiOfficeBuilding />{user?.department_name}</span>
            )}
            <span className="flex items-center gap-1"><HiCalendar />Joined {formatDate(user?.created_at)}</span>
          </div>
          <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${ROLE_STYLE[user?.role]}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <HiUser className="text-blue-500" /> Edit Profile
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <select
              value={profileForm.department}
              onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
              className="input-field"
            >
              <option value="">None</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <HiLockClosed className="text-blue-500" /> Change Password
        </h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={pwForm.old_password}
              onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwForm.new_password}
              onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
              className="input-field"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={pwForm.confirm}
              onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
              className="input-field"
              placeholder="Repeat new password"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPw} className="btn-primary">
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
