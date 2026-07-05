import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as loginApi, getProfile } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await getProfile()
      setUser(data)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (credentials) => {
    const { data } = await loginApi(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const isAdmin = user?.role === 'ADMIN'
  const isTeacher = user?.role === 'TEACHER'
  const isStudent = user?.role === 'STUDENT'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isTeacher, isStudent, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
