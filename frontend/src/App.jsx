import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Layout from './components/common/Layout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Shared
import Profile from './pages/Profile'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import Users from './pages/admin/Users'
import Departments from './pages/admin/Departments'
import Classrooms from './pages/admin/Classrooms'
import AdminAttendance from './pages/admin/AdminAttendance'
import Reports from './pages/admin/Reports'

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import Sessions from './pages/teacher/Sessions'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import TeacherReports from './pages/teacher/TeacherReports'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import QRScanner from './pages/student/QRScanner'
import AttendanceHistory from './pages/student/AttendanceHistory'

// Admin sessions page (reuse teacher sessions component)
import AdminSessions from './pages/teacher/Sessions'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/unauthorized" element={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-white">403</h1>
                  <p className="text-gray-500 mt-2">You don't have permission to view this page.</p>
                </div>
              </div>
            } />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><Layout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="departments" element={<Departments />} />
              <Route path="classrooms" element={<Classrooms />} />
              <Route path="sessions" element={<AdminSessions />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Teacher */}
            <Route path="/teacher" element={<ProtectedRoute roles={['TEACHER']}><Layout /></ProtectedRoute>}>
              <Route index element={<TeacherDashboard />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="attendance" element={<TeacherAttendance />} />
              <Route path="reports" element={<TeacherReports />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Student */}
            <Route path="/student" element={<ProtectedRoute roles={['STUDENT']}><Layout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="scan" element={<QRScanner />} />
              <Route path="history" element={<AttendanceHistory />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
