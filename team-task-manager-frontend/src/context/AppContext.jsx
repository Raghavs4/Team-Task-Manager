import { createContext, useContext, useState, useCallback } from 'react'
import { getProjectsApi } from '../services/projectService'

const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true)
    try {
      const res = await getProjectsApi()
      setProjects(res.data.projects || [])
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setProjectsLoading(false)
    }
  }, [])

  const addProject = (project) => {
    setProjects((prev) => [project, ...prev])
  }

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <AppContext.Provider
      value={{
        projects,
        projectsLoading,
        selectedProject,
        setSelectedProject,
        fetchProjects,
        addProject,
        sidebarOpen,
        toggleSidebar,
        closeSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
