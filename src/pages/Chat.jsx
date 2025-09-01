import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Eye } from 'lucide-react'
import { analysisService } from '../services/analysis'
import ChatInterface from '../components/chat/ChatInterface'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage, { NotFoundError } from '../components/common/ErrorMessage'

const Chat = () => {
  const { analysisId } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (analysisId) {
      fetchAnalysis()
    }
  }, [analysisId])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await analysisService.getAnalysis(analysisId)

      if (result.success) {
        setAnalysis(result.analysis)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading chat..." />
      </div>
    )
  }

  if (error) {
    return error.includes('not found') ? (
      <NotFoundError
        title="Analysis Not Found"
        message="The analysis you're trying to chat about doesn't exist or has been deleted."
        actionText="Back to Dashboard"
        onAction={() => navigate('/dashboard')}
      />
    ) : (
      <ErrorMessage
        error={error}
        title="Failed to load analysis"
        showRetry={true}
        onRetry={fetchAnalysis}
      />
    )
  }

  if (!analysis) {
    return (
      <NotFoundError
        title="Analysis Not Found"
        message="The analysis you're looking for doesn't exist."
        actionText="Back to Dashboard"
        onAction={() => navigate('/dashboard')}
      />
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/analysis/${analysisId}`)}
            className="btn btn-secondary p-2"
            title="Back to analysis"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            {analysis.imageUrl && (
              <img
                src={analysis.imageUrl}
                alt={analysis.title}
                className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            )}
            <div>
              <h1 className="font-semibold">{analysis.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chat about this analysis
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/analysis/${analysisId}`}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View Analysis</span>
          </Link>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          analysisId={analysisId}
          analysis={analysis}
        />
      </div>
    </div>
  )
}

export default Chat