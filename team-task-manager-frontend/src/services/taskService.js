import api from './api'

// POST /api/tasks
export const createTaskApi = (data) => api.post('/tasks', data)

// GET /api/tasks/my-tasks
export const getMyTasksApi = () => api.get('/tasks/my-tasks')

// GET /api/tasks/project/:projectId
export const getTasksByProjectApi = (projectId) =>
  api.get(`/tasks/project/${projectId}`)

// PUT /api/tasks/:id
export const updateTaskApi = (id, data) => api.put(`/tasks/${id}`, data)

// DELETE /api/tasks/:id
export const deleteTaskApi = (id) => api.delete(`/tasks/${id}`)

// PATCH /api/tasks/:id/status
export const updateTaskStatusApi = (id, status) =>
  api.patch(`/tasks/${id}/status`, { status })
