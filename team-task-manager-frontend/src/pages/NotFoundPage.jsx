import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
    <p className="text-8xl font-bold text-surface-border mb-4 font-mono">404</p>
    <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
    <p className="text-slate-500 mb-8">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary">
      Back to Dashboard
    </Link>
  </div>
)

export default NotFoundPage
