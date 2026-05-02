import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { getGlobalSummaryApi } from '../services/dashboardService'
import StatCard from '../components/StatCard.jsx'
import Spinner from '../components/Spinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

const DashboardPage = () => {
  const { user } = useAuth()
  const { projects, fetchProjects, projectsLoading } = useApp()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [summaryRes] = await Promise.all([
          getGlobalSummaryApi(),
          fetchProjects(),
        ])
        setSummary(summaryRes.data.summary)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening across your projects.</p>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError('')} />

      {/* Stats Grid */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={summary.totalProjects}
            color="brand"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <StatCard
            title="Total Tasks"
            value={summary.totalTasks}
            color="slate"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          <StatCard
            title="Assigned to Me"
            value={summary.myAssignedTasks}
            color="green"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <StatCard
            title="Overdue Tasks"
            value={summary.overdueTasks}
            color="red"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Tasks By Status */}
      {summary && (
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4">Tasks by Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'To Do', key: 'To Do', color: 'bg-slate-500', bg: 'bg-slate-500/10 border-slate-500/20 text-slate-300' },
              { label: 'In Progress', key: 'In Progress', color: 'bg-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' },
              { label: 'Done', key: 'Done', color: 'bg-green-500', bg: 'bg-green-500/10 border-green-500/20 text-green-300' },
            ].map(({ label, key, color, bg }) => {
              const count = summary.tasksByStatus[key] || 0
              const total = summary.totalTasks || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={key} className={`border rounded-xl p-4 ${bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-1.5">
                    <div
                      className={`${color} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 opacity-60">{pct}% of total</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Projects list */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Your Projects</h2>
        {projectsLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : projects.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No projects yet</p>
            <p className="text-slate-600 text-sm mt-1">
              Go to Projects to create your first one
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div key={proj._id} className="card hover:border-brand-500/30 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
                    {proj.name}
                  </h3>
                  <span className="text-xs bg-surface-hover text-slate-400 px-2 py-0.5 rounded-full">
                    {proj.members.length} member{proj.members.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {proj.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">{proj.description}</p>
                )}
                <p className="text-xs text-slate-600 mt-3">
                  Created by {proj.createdBy?.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
