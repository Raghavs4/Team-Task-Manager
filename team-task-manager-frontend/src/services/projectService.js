import api from './api'

// GET /api/projects
export const getProjectsApi = () => api.get('/projects')

// GET /api/projects/:id
export const getProjectByIdApi = (id) => api.get(`/projects/${id}`)

// POST /api/projects
export const createProjectApi = (data) => api.post('/projects', data)

// POST /api/projects/:id/members
export const addMemberApi = (projectId, data) =>
  api.post(`/projects/${projectId}/members`, data)

// DELETE /api/projects/:id/members/:userId
export const removeMemberApi = (projectId, userId) =>
  api.delete(`/projects/${projectId}/members/${userId}`)
