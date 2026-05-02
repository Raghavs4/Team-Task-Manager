import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import {
  getProjectByIdApi,
  createProjectApi,
  addMemberApi,
  removeMemberApi,
} from '../services/projectService'
import Modal from '../components/Modal.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

// ── Create Project Modal ────────────────────────────────────────────────────
const CreateProjectModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Project name is required.'); return }
    setLoading(true)
    try {
      const res = await createProjectApi(form)
      onCreated(res.data.project)
      setForm({ name: '', description: '' })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <ErrorMessage message={error} onDismiss={() => setError('')} />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => { setForm({ ...form, name: e.target.value }); setError('') }}
            placeholder="My Awesome Project"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is this project about?"
            rows={3}
            className="input-field resize-none"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" /> Creating…</> : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Add Member Modal ────────────────────────────────────────────────────────
const AddMemberModal = ({ isOpen, onClose, projectId, onMemberAdded }) => {
  const [form, setForm] = useState({ userId: '', role: 'Member' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.userId.trim()) { setError('User ID is required.'); return }
    setLoading(true)
    try {
      const res = await addMemberApi(projectId, form)
      onMemberAdded(res.data.project)
      setForm({ userId: '', role: 'Member' })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Member">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <ErrorMessage message={error} onDismiss={() => setError('')} />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">User ID *</label>
          <input
            type="text"
            value={form.userId}
            onChange={(e) => { setForm({ ...form, userId: e.target.value }); setError('') }}
            placeholder="Paste the user's MongoDB ID"
            className="input-field font-mono text-xs"
          />
          <p className="text-xs text-slate-600 mt-1">The user must already have an account.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="input-field"
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><Spinner size="sm" /> Adding…</> : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Project Detail Panel ────────────────────────────────────────────────────
const ProjectDetail = ({ project, onClose, currentUserId, onUpdate }) => {
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [removeLoading, setRemoveLoading] = useState(null)
  const [error, setError] = useState('')

  const currentMember = project.members?.find(
    (m) => m.user._id === currentUserId || m.user === currentUserId
  )
  const isAdmin = currentMember?.role === 'Admin'

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member?')) return
    setRemoveLoading(userId)
    setError('')
    try {
      const res = await removeMemberApi(project._id, userId)
      onUpdate(res.data.project)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.')
    } finally {
      setRemoveLoading(null)
    }
  }

  return (
    <div className="card animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{project.name}</h2>
          {project.description && (
            <p className="text-slate-500 text-sm mt-1">{project.description}</p>
          )}
          <p className="text-xs text-slate-600 mt-2">
            Created by {project.createdBy?.name} · {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Members */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300">
            Members ({project.members?.length || 0})
          </h3>
          {isAdmin && (
            <button
              onClick={() => setAddMemberOpen(true)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Member
            </button>
          )}
        </div>

        <div className="space-y-2">
          {project.members?.map((m) => {
            const userId = m.user._id || m.user
            const name = m.user.name || 'Unknown'
            const email = m.user.email || ''
            const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            const canRemove = isAdmin && userId !== project.createdBy?._id

            return (
              <div key={userId} className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover">
                <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/30
                                flex items-center justify-center text-xs font-semibold text-brand-400 flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{name}</p>
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  m.role === 'Admin'
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-surface-border text-slate-400'
                }`}>
                  {m.role}
                </span>
                {canRemove && (
                  <button
                    onClick={() => handleRemove(userId)}
                    disabled={removeLoading === userId}
                    className="p-1 text-slate-600 hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    {removeLoading === userId ? (
                      <Spinner size="sm" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Member ID helper */}
      <div className="mt-4 p-3 bg-brand-600/5 border border-brand-500/20 rounded-xl">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-brand-400">Your User ID:</span>{' '}
          <code className="font-mono">{currentUserId}</code>
        </p>
        <p className="text-xs text-slate-600 mt-0.5">Share this to be added to projects.</p>
      </div>

      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        projectId={project._id}
        onMemberAdded={onUpdate}
      />
    </div>
  )
}

// ── Projects Page ───────────────────────────────────────────────────────────
const ProjectsPage = () => {
  const { user } = useAuth()
  const { projects, fetchProjects, projectsLoading, addProject } = useApp()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProjects()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectProject = async (proj) => {
    setDetailLoading(true)
    setError('')
    try {
      const res = await getProjectByIdApi(proj._id)
      setSelectedProject(res.data.project)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleProjectCreated = (project) => {
    addProject(project)
  }

  const handleProjectUpdate = (updatedProject) => {
    setSelectedProject(updatedProject)
    fetchProjects()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-500 mt-1">Manage your teams and projects</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      <div className={`grid gap-6 ${selectedProject ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Projects Grid */}
        <div>
          {projectsLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : projects.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 bg-surface-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">No projects yet</h3>
              <p className="text-slate-500 text-sm mb-6">Create your first project to get started</p>
              <button onClick={() => setCreateOpen(true)} className="btn-primary mx-auto inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const isSelected = selectedProject?._id === proj._id
                const myMember = proj.members?.find(
                  (m) => (m.user._id || m.user) === user?.id
                )
                return (
                  <button
                    key={proj._id}
                    onClick={() => handleSelectProject(proj)}
                    className={`card text-left hover:border-brand-500/40 transition-all duration-200 w-full
                      ${isSelected ? 'border-brand-500/60 bg-brand-600/5' : ''}`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30
                                      flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{proj.name}</h3>
                        {proj.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{proj.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                      <span>{proj.members?.length || 0} members</span>
                      {myMember && (
                        <span className={`px-2 py-0.5 rounded-full ${
                          myMember.role === 'Admin'
                            ? 'bg-brand-500/20 text-brand-400'
                            : 'bg-surface-border text-slate-400'
                        }`}>
                          {myMember.role}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Project Detail */}
        {detailLoading && (
          <div className="card flex items-center justify-center min-h-48">
            <Spinner />
          </div>
        )}
        {selectedProject && !detailLoading && (
          <ProjectDetail
            project={selectedProject}
            currentUserId={user?.id}
            onClose={() => setSelectedProject(null)}
            onUpdate={handleProjectUpdate}
          />
        )}
      </div>

      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  )
}

export default ProjectsPage
