import { useState } from 'react'
import { updateTaskStatusApi, deleteTaskApi } from '../services/taskService'

const STATUS_COLORS = {
  'To Do':      'bg-slate-500/20 text-slate-300 border-slate-500/30',
  'In Progress': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Done':       'bg-green-500/20 text-green-300 border-green-500/30',
}

const PRIORITY_COLORS = {
  Low:    'bg-blue-500/20 text-blue-300',
  Medium: 'bg-yellow-500/20 text-yellow-300',
  High:   'bg-red-500/20 text-red-300',
}

const TaskCard = ({ task, onStatusChange, onDelete, canEdit }) => {
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const statuses = ['To Do', 'In Progress', 'Done']

  const handleStatusChange = async (newStatus) => {
    if (newStatus === task.status) return
    setStatusLoading(true)
    try {
      await updateTaskStatusApi(task._id, newStatus)
      onStatusChange?.(task._id, newStatus)
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return
    setDeleteLoading(true)
    try {
      await deleteTaskApi(task._id)
      onDelete?.(task._id)
    } catch (err) {
      console.error('Failed to delete task:', err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const isOverdue =
    task.dueDate &&
    task.status !== 'Done' &&
    new Date(task.dueDate) < new Date()

  return (
    <div className="card hover:border-brand-500/30 transition-all duration-200 animate-slide-up group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-white text-sm leading-snug flex-1">{task.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10
                         transition-colors disabled:opacity-50"
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`badge border ${STATUS_COLORS[task.status]}`}>{task.status}</span>
        <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
        {isOverdue && (
          <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">
            Overdue
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
        {task.assignedTo && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {task.assignedTo.name}
          </span>
        )}
        {task.dueDate && (
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.project?.name && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {task.project.name}
          </span>
        )}
      </div>

      {/* Status switcher */}
      <div className="flex gap-1 pt-3 border-t border-surface-border">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={statusLoading}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-all duration-200
              ${task.status === s
                ? 'bg-brand-600 text-white'
                : 'text-slate-500 hover:text-white hover:bg-surface-hover'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TaskCard
