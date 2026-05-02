import { useEffect, useState, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import {
  createTaskApi,
  getTasksByProjectApi,
  getMyTasksApi,
} from '../services/taskService'
import { getProjectByIdApi } from '../services/projectService'
import TaskCard from '../components/TaskCard.jsx'
import Modal from '../components/Modal.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

// ── Create Task Modal ───────────────────────────────────────────────────────
const CreateTaskModal = ({ isOpen, onClose, projects, onCreated }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium',
  })
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)
  const [error, setError] = useState('')

  const handleProjectChange = async (e) => {
    const projectId = e.target.value
    setForm({ ...form, projectId, assignedTo: '' })
    if (!projectId) { setMembers([]); return }
    setMembersLoading(true)
    try {
      const res = await getProjectByIdApi(projectId)
      setMembers(res.data.project.members || [])
    } catch {
      setMembers([])
    } finally {
      setMembersLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Task title is required.'); return }
    if (!form.projectId) { setError('Please select a project.'); return }
    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        projectId: form.projectId,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assignedTo: form.assignedTo || undefined,
      }
      const res = await createTaskApi(payload)
      onCreated(res.data.task)
      setForm({ title: '', description: '', projectId: '', assignedTo: '', dueDate: '', priority: 'Medium' })
      setMembers([])
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => { setForm({ ...form, title: e.target.value }); setError('') }}
            placeholder="Task title"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Task description (optional)"
            rows={2}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Project *</label>
          <select value={form.projectId} onChange={handleProjectChange} className="input-field">
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Assign to</label>
          <select
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            className="input-field"
            disabled={!form.projectId || membersLoading}
          >
            <option value="">Unassigned</option>
            {members.map((m) => {
              const id = m.user._id || m.user
              const name = m.user.name || id
              return <option key={id} value={id}>{name}</option>
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="input-field"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" /> Creating…</> : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Tasks Page ──────────────────────────────────────────────────────────────
const TasksPage = () => {
  const { user } = useAuth()
  const { projects, fetchProjects } = useApp()

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  // Filters
  const [viewMode, setViewMode] = useState('my') // 'my' | 'project'
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProjects()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let res
      if (viewMode === 'my') {
        res = await getMyTasksApi()
      } else if (viewMode === 'project' && selectedProjectId) {
        res = await getTasksByProjectApi(selectedProjectId)
      } else {
        setTasks([])
        setLoading(false)
        return
      }
      setTasks(res.data.tasks || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }, [viewMode, selectedProjectId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleTaskCreated = () => {
    loadTasks()
  }

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    )
  }

  const handleDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId))
  }

  // Apply filters
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const statusCounts = {
    'To Do': tasks.filter((t) => t.status === 'To Do').length,
    'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
    'Done': tasks.filter((t) => t.status === 'Done').length,
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage and track your work</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* View toggle + project selector */}
      <div className="card space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('my')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'my' ? 'bg-brand-600 text-white' : 'bg-surface-hover text-slate-400 hover:text-white'
            }`}
          >
            My Tasks
          </button>
          <button
            onClick={() => setViewMode('project')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'project' ? 'bg-brand-600 text-white' : 'bg-surface-hover text-slate-400 hover:text-white'
            }`}
          >
            By Project
          </button>
        </div>

        {viewMode === 'project' && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="input-field"
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        )}

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="All">All Status</option>
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="All">All Priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      {/* Status summary bar */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(statusCounts).map(([status, count]) => {
            const colors = {
              'To Do': 'border-slate-500/20 text-slate-300',
              'In Progress': 'border-yellow-500/20 text-yellow-300',
              'Done': 'border-green-500/20 text-green-300',
            }
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
                className={`card py-3 text-center border transition-all hover:scale-[1.02] ${
                  statusFilter === status ? 'border-brand-500/50 bg-brand-600/10' : colors[status]
                }`}
              >
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs mt-0.5 opacity-75">{status}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
      ) : viewMode === 'project' && !selectedProjectId ? (
        <div className="card text-center py-16">
          <p className="text-slate-500">Select a project to view its tasks</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-white font-semibold mb-2">
            {tasks.length === 0 ? 'No tasks found' : 'No tasks match your filters'}
          </h3>
          {tasks.length === 0 && (
            <button onClick={() => setCreateOpen(true)} className="btn-primary mx-auto inline-flex items-center gap-2 mt-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isCreator = task.createdBy?._id === user?.id || task.createdBy === user?.id
            return (
              <TaskCard
                key={task._id}
                task={task}
                canEdit={isCreator}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            )
          })}
        </div>
      )}

      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        projects={projects}
        onCreated={handleTaskCreated}
      />
    </div>
  )
}

export default TasksPage
