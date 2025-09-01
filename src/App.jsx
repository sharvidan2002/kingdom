import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './context/ThemeContext'

// Import pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Analysis from './pages/Analysis'
import Chat from './pages/Chat'
import Videos from './pages/Videos'
import Profile from './pages/Profile'

// Import components
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import LoadingSpinner from './components/common/LoadingSpinner'
import AuthCallback from './components/auth/AuthCallback'

function App() {
  const { user, loading } = useAuth()
  const { theme } = useTheme()

  // Apply theme class to html element
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Home />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/auth/success" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={user ? <ProtectedLayout><Dashboard /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/upload"
          element={user ? <ProtectedLayout><Upload /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/analysis/:id"
          element={user ? <ProtectedLayout><Analysis /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chat/:analysisId"
          element={user ? <ProtectedLayout><Chat /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/videos/:analysisId"
          element={user ? <ProtectedLayout><Videos /></ProtectedLayout> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <ProtectedLayout><Profile /></ProtectedLayout> : <Navigate to="/login" replace />}
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// Layout component for protected routes
function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default App