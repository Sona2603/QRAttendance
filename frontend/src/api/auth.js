import api from './axios'

export const login = (credentials) => api.post('/auth/login/', credentials)
export const register = (data) => api.post('/auth/register/', data)
export const getProfile = () => api.get('/auth/profile/')
export const updateProfile = (data) => api.patch('/auth/profile/', data)
export const changePassword = (data) => api.post('/auth/change-password/', data)
export const getUsers = (params) => api.get('/auth/users/', { params })
export const createUser = (data) => api.post('/auth/users/', data)
export const updateUser = (id, data) => api.patch(`/auth/users/${id}/`, data)
export const deleteUser = (id) => api.delete(`/auth/users/${id}/`)
