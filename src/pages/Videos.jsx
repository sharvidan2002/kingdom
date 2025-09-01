import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react'
import { analysisService } from '../services/analysis'
import VideoGrid from '../components/youtube/VideoGrid'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage, { NotFoundError } from '../components/common/ErrorMessage'
import { getContentTypeInfo } from '../utils/helpers'

const Videos = () => {
  const { analysisId } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [videos, setVideos] = useState([])
  const [keyTopics, setKeyTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisAndVideos()
    }
  }, [analysisId])

  const fetchAnalysisAndVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      const [analysisResult, videosResult] = await Promise.all([
        analysisService.getAnalysis(analysisId),
        analysisService.getYoutubeVideos(analysisId)
      ])

      if (analysisResult.success) {
        setAnalysis(analysisResult.analysis)
      }

      if (videosResult.success) {
        setVideos(videosResult.videos || [])
        setKeyTopics(videosResult.keyTopics || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshVideos = async () => {
    try {
      const result = await analysisService.refreshYoutubeVideos(analysisId)

      if (result.success) {
        setVideos(result.videos || [])
        return true
      }

      throw new Error('Failed to refresh videos')
    } catch (error) {
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading videos..." />
      </div>
    )
  }

  if (error) {
    return error.includes('not found') ? (
      <NotFoundError
        title="Analysis Not Found"
        message="The analysis you're looking for doesn't exist or has been deleted."
        actionText="Back to Dashboard"
        onAction={() => navigate('/dashboard')}
      />
    ) : (
      <ErrorMessage
        error={error}
        title="Failed to load videos"
        showRetry={true}
        onRetry={fetchAnalysisAndVideos}
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

  const contentInfo = getContentTypeInfo(analysis.contentType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{analysis.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{contentInfo.icon}</span>
                <span>{contentInfo.label}</span>
                <span>•</span>
                <span>{videos.length} videos found</span>
              </div>
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

      {/* Analysis Summary Card */}
      {analysis.analysis?.summary && (
        <div className="card p-6">
          <h2 className="font-semibold mb-3">What you're studying</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {analysis.analysis.summary}
          </p>

          {keyTopics.length > 0 && (
            <div>
              <h3 className="font-medium text-sm mb-2">Related topics:</h3>
              <div className="flex flex-wrap gap-2">
                {keyTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Grid */}
      <VideoGrid
        analysisId={analysisId}
        videos={videos}
        keyTopics={keyTopics}
        onRefresh={handleRefreshVideos}
      />

      {/* Help Text */}
      <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
          Video Learning Tips
        </h3>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <p>• Watch videos that match your learning style and pace</p>
          <p>• Use the search function to find specific topics or concepts</p>
          <p>• Videos are curated based on your study material's key topics</p>
          <p>• Click refresh to get new video recommendations</p>
        </div>
      </div>
    </div>
  )
}

export default Videos