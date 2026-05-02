import api from './api'

// GET /api/dashboard/summary
export const getGlobalSummaryApi = () => api.get('/dashboard/summary')

// GET /api/dashboard/:projectId
export const getProjectDashboardApi = (projectId) =>
  api.get(`/dashboard/${projectId}`)
