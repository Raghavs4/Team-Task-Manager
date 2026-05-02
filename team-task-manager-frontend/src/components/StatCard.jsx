const StatCard = ({ title, value, icon, color = 'brand', subtitle }) => {
  const colors = {
    brand:  'bg-brand-500/10 text-brand-400 border-brand-500/20',
    green:  'bg-green-500/10  text-green-400  border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red:    'bg-red-500/10    text-red-400    border-red-500/20',
    slate:  'bg-slate-500/10  text-slate-400  border-slate-500/20',
  }

  return (
    <div className="card hover:border-surface-hover transition-colors animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default StatCard
