import api from './axios'

export const getClassrooms = (params) => api.get('/classrooms/', { params })
export const getClassroom = (id) => api.get(`/classrooms/${id}/`)
export const createClassroom = (data) => api.post('/classrooms/', data)
export const updateClassroom = (id, data) => api.put(`/classrooms/${id}/`, data)
export const deleteClassroom = (id) => api.delete(`/classrooms/${id}/`)
export const addStudent = (id, student_id) => api.post(`/classrooms/${id}/add-student/`, { student_id })
export const removeStudent = (classId, studentId) => api.delete(`/classrooms/${classId}/remove-student/${studentId}/`)
