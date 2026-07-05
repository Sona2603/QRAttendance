import api from './axios'

export const getSessions = (params) => api.get('/attendance/sessions/', { params })
export const getSession = (id) => api.get(`/attendance/sessions/${id}/`)
export const createSession = (data) => api.post('/attendance/sessions/', data)
export const updateSession = (id, data) => api.patch(`/attendance/sessions/${id}/`, data)
export const deleteSession = (id) => api.delete(`/attendance/sessions/${id}/`)

export const scanQR = (data) => api.post('/attendance/scan/', data)
export const getAttendance = (params) => api.get('/attendance/', { params })
export const getHistory = () => api.get('/attendance/history/')

export const getStats = () => api.get('/attendance/stats/')
export const getMonthly = (year) => api.get('/attendance/monthly/', { params: { year } })
export const getDeptStats = () => api.get('/attendance/department-stats/')

export const exportCSV = (params) => api.get('/attendance/export/csv/', { params, responseType: 'blob' })
export const exportExcel = (params) => api.get('/attendance/export/excel/', { params, responseType: 'blob' })
