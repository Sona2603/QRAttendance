import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/auth'
import { getDepartments } from '../../api/departments'
import { getErrorMessage } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { HiQrcode } from 'react-icons/hi'

export default function Register() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '', role: 'STUDENT', department: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getDepartments().then(r => setDepartments(r.data.results || r.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register(form)
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <HiQrcode className="text-white text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input type="text" required value={form.name} onChange={set('name')} className="input-field" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={set('email')} className="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select value={form.role} onChange={set('role')} className="input-field">
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <select value={form.department} onChange={set('department')} className="input-field">
  <option value="">Select Department</option>

  {departments.length > 0 ? (
    departments.map((d) => (
      <option key={d.id} value={d.id}>
        {d.name}
      </option>
    ))
  ) : (
    <>
      <option value="1">Computer Science</option>
      <option value="2">Information Technology</option>
      <option value="3">Electronics & Communication</option>
      <option value="4">Mechanical Engineering</option>
      <option value="5">Civil Engineering</option>
      <option value="6">Human Resources</option>
      <option value="7">Marketing</option>
      <option value="8">Finance</option>
      <option value="9">Operations</option>
    </>
  )}
</select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input type="password" required minLength={8} value={form.password} onChange={set('password')} className="input-field" placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input type="password" required value={form.password2} onChange={set('password2')} className="input-field" placeholder="Repeat password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Register'}
          </button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
