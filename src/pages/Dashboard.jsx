import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  PlusCircle,
  Download,
  MessageSquare,
  Play,
  Brain
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { analysisService } from '../services/analysis'
import { exportService } from '../services/export'
import AnalysisCard from '../components/analysis/AnalysisCard'
import UploadHistory from '../components/upload/UploadHistory'
import LoadingSpinner, { InlineLoader } from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [statistics, setStatistics] = useState(null)
  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchQuery = searchParams.get('search')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsResult, analysesResult] = await Promise.all([
        analysisService.getAnalysisStatistics(),
        analysisService.getAllAnalyses(1, 6) // Get 6 recent analyses
      ])

      if (statsResult.success) {
        setStatistics(statsResult.statistics)
      }

      if (analysesResult.success) {
        setRecentAnalyses(analysesResult.analyses)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (analysisId) => {
    try {
      await exportService.exportAndDownload(analysisId)
      toast.success('PDF exported successfully!')
    } catch (error) {
      toast.error('Failed to export PDF')
    }
  }

  const handleShare = async (analysis) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: analysis.title,
          text: analysis.analysis?.summary || 'Check out this AI analysis',
          url: window.location.origin + `/analysis/${analysis._id}`
        })
      } else {
        // Fallback to clipboard
        const shareText = `${analysis.title}\n\n${analysis.analysis?.summary || ''}\n\nView at: ${window.location.origin}/analysis/${analysis._id}`
        await navigator.clipboard.writeText(shareText)
        toast.success('Analysis details copied to clipboard!')
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading your dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title="Failed to load dashboard"
        showRetry={true}
        onRetry={fetchDashboardData}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : "Here's what's happening with your study materials"
            }
          </p>
        </div>

        <Link
          to="/upload"
          className="btn btn-primary flex items-center gap-2 mt-4 sm:mt-0"
        >
          <PlusCircle className="w-4 h-4" />
          Upload New Material
        </Link>
      </div>

      {/* Statistics Cards */}
      {statistics && !searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Analyses"
            value={statistics.totalAnalyses || 0}
            icon={FileText}
            color="blue"
            change="+12% this month"
          />

          <StatCard
            title="Quiz Questions"
            value={statistics.totalQuizQuestions || 0}
            icon={MessageSquare}
            color="green"
            change="+8% this week"
          />

          <StatCard
            title="Flashcards"
            value={statistics.totalFlashcards || 0}
            icon={Brain}
            color="purple"
            change="+15% this week"
          />

          <StatCard
            title="Study Sessions"
            value={statistics.totalAnalyses || 0}
            icon={TrendingUp}
            color="orange"
            change="Active learning"
          />
        </div>
      )}

      {/* Content Type Breakdown */}
      {statistics && !searchQuery && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Content Type Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ContentTypeCard
              type="handwritten"
              count={statistics.handwrittenCount || 0}
              total={statistics.totalAnalyses || 0}
              icon="✍️"
              label="Handwritten Notes"
            />

            <ContentTypeCard
              type="textbook"
              count={statistics.textbookCount || 0}
              total={statistics.totalAnalyses || 0}
              icon="📚"
              label="Textbook Pages"
            />

            <ContentTypeCard
              type="diagram"
              count={statistics.diagramCount || 0}
              total={statistics.totalAnalyses || 0}
              icon="📊"
              label="Diagrams"
            />
          </div>
        </div>
      )}

      {/* Recent Analyses or Search Results */}
      <div>
        {searchQuery ? (
          <UploadHistory />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Analyses</h2>
              {recentAnalyses.length > 0 && (
                <Link
                  to="/dashboard?view=all"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  View all →
                </Link>
              )}
            </div>

            {recentAnalyses.length === 0 ? (
              <div className="card p-12 text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Start Your Learning Journey</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Upload your first study material to see AI-powered summaries, quiz questions,
                  and interactive learning tools appear here.
                </p>
                <Link
                  to="/upload"
                  className="btn btn-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Material
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentAnalyses.map((analysis) => (
                  <AnalysisCard
                    key={analysis._id}
                    analysis={analysis}
                    onExport={handleExport}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Actions */}
      {!searchQuery && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/upload"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Upload className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">New Upload</span>
            </Link>

            <Link
              to="/dashboard?contentType=handwritten"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium">My Notes</span>
            </Link>

            <Link
              to="/dashboard?contentType=textbook"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-purple-500" />
              <span className="text-sm font-medium">Textbooks</span>
            </Link>

            <Link
              to="/profile"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-orange-500" />
              <span className="text-sm font-medium">Progress</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20'
  }

  return (
    <div className="card p-6 hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

const ContentTypeCard = ({ type, count, total, icon, label }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-bold text-lg">{count}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{label}</div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{percentage}%</div>
    </div>
  )
}

export default Dashboard