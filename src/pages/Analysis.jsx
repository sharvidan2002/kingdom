import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, MessageSquare, Play, Share2, Trash2 } from 'lucide-react'
import { analysisService } from '../services/analysis'
import { exportService } from '../services/export'
import { uploadService } from '../services/upload'
import AnalysisDetails from '../components/analysis/AnalysisDetails'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorMessage, { NotFoundError } from '../components/common/ErrorMessage'
import toast from 'react-hot-toast'

const Analysis = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchAnalysis()
    }
  }, [id])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await analysisService.getAnalysis(id)

      if (result.success) {
        setAnalysis(result.analysis)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      await exportService.exportAndDownload(id)
      toast.success('PDF exported successfully!')
    } catch (error) {
      toast.error('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return
    }

    try {
      await uploadService.deleteUpload(id)
      toast.success('Analysis deleted successfully')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to delete analysis')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: analysis.title,
          text: analysis.analysis?.summary || 'Check out this AI analysis',
          url: window.location.href
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share error:', error)
      toast.error('Failed to share analysis')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" text="Loading analysis..." />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary p-2"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-xl font-bold">Analysis Details</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Comprehensive AI analysis of your study material
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`/chat/${id}`}
            className="btn btn-secondary flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </Link>

          <Link
            to={`/videos/${id}`}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Videos</span>
          </Link>

          <button
            onClick={handleShare}
            className="btn btn-secondary flex items-center gap-2"
            title="Share analysis"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-primary flex items-center gap-2"
          >
            {exporting ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {exporting ? 'Exporting...' : 'Export PDF'}
            </span>
          </button>

          <button
            onClick={handleDelete}
            className="btn btn-danger flex items-center gap-2"
            title="Delete analysis"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analysis Content */}
      <AnalysisDetails
        analysis={analysis}
        onExport={handleExport}
      />
    </div>
  )
}

export default Analysis