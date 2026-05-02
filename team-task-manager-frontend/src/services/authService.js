import api from './api'

// POST /api/auth/signup
export const signupApi = (data) => api.post('/auth/signup', data)

// POST /api/auth/login
export const loginApi = (data) => api.post('/auth/login', data)

// GET /api/auth/me
export const getMeApi = () => api.get('/auth/me')
