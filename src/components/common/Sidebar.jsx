import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  FileText,
  MessageSquare,
  Play,
  User,
  X,
  PlusCircle,
  BarChart3,
  BookOpen,
  Download
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and recent activity'
    },
    {
      label: 'Upload',
      href: '/upload',
      icon: Upload,
      description: 'Upload new study materials'
    }
  ]

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(href)
  }

  const quickActions = [
    {
      label: 'New Upload',
      href: '/upload',
      icon: PlusCircle,
      variant: 'primary'
    }
  ]

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-sm">AI</span>
              </div>
              <span className="font-semibold text-lg">Study Helper</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    sidebar-item group
                    ${isActive(item.href) ? 'active' : ''}
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs opacity-75 mt-0.5">{item.description}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent Analyses Section */}
            <div className="pt-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Recent
              </h3>
              <div className="space-y-1">
                <RecentAnalysesList onItemClick={onClose} />
              </div>
            </div>
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${action.variant === 'primary'
                      ? 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Component to show recent analyses in sidebar
const RecentAnalysesList = ({ onItemClick }) => {
  const [recentAnalyses, setRecentAnalyses] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchRecentAnalyses = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/analysis?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setRecentAnalyses(data.analyses || [])
        }
      } catch (error) {
        console.error('Error fetching recent analyses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentAnalyses()
  }, [])

  if (loading) {
    return (
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    )
  }

  if (recentAnalyses.length === 0) {
    return (
      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
        No recent analyses
      </div>
    )
  }

  return (
    <>
      {recentAnalyses.slice(0, 3).map((analysis) => (
        <Link
          key={analysis._id}
          to={`/analysis/${analysis._id}`}
          onClick={onItemClick}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="flex-shrink-0">
            <FileText className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {analysis.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(analysis.createdAt).toLocaleDateString()}
            </div>
          </div>
        </Link>
      ))}

      {recentAnalyses.length > 3 && (
        <Link
          to="/dashboard"
          onClick={onItemClick}
          className="block px-4 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          View all analyses →
        </Link>
      )}
    </>
  )
}

export default Sidebar