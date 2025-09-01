import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Image, BarChart3, Calendar, Search, Filter, Trash2, Eye, MessageSquare, Play } from 'lucide-react'
import { uploadService } from '../../services/upload'
import { formatDate, getContentTypeInfo } from '../../utils/helpers'
import LoadingSpinner, { InlineLoader } from '../common/LoadingSpinner'
import ErrorMessage, { EmptyState } from '../common/ErrorMessage'
import { CONTENT_TYPES } from '../../utils/constants'

const UploadHistory = ({ limit = null, showHeader = true }) => {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContentType, setSelectedContentType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const pageSize = limit || 10

  useEffect(() => {
    fetchUploads()
  }, [currentPage, selectedContentType])

  const fetchUploads = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await uploadService.getUserUploads(
        currentPage,
        pageSize,
        selectedContentType || null
      )

      if (result.success) {
        setUploads(result.analyses)
        setPagination(result.pagination)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // In a real implementation, this would trigger a search API call
    console.log('Searching for:', searchQuery)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return
    }

    try {
      await uploadService.deleteUpload(id)
      toast.success('Analysis deleted successfully')
      fetchUploads() // Refresh the list
    } catch (error) {
      toast.error('Failed to delete analysis')
    }
  }

  const filteredUploads = uploads.filter(upload =>
    upload.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    upload.analysis?.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <InlineLoader text="Loading your uploads..." />
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title="Failed to load uploads"
        showRetry={true}
        onRetry={fetchUploads}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Your Analyses</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {pagination?.totalItems || 0} total analyses
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search analyses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 text-sm"
              />
            </form>

            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="input text-sm w-auto"
            >
              <option value="">All Types</option>
              {Object.values(CONTENT_TYPES).map(type => (
                <option key={type} value={type}>
                  {getContentTypeInfo(type).label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Upload Grid */}
      {filteredUploads.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-full h-full" />}
          title="No analyses found"
          description={searchQuery
            ? "No analyses match your search criteria. Try different keywords or filters."
            : "You haven't uploaded any study materials yet. Upload your first image to get started!"
          }
          action={
            !searchQuery && (
              <Link to="/upload" className="btn btn-primary">
                Upload First Material
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUploads.map((upload) => (
            <UploadCard
              key={upload._id}
              upload={upload}
              onDelete={() => handleDelete(upload._id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && !limit && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary text-sm"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
            disabled={currentPage === pagination.totalPages}
            className="btn btn-secondary text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

const UploadCard = ({ upload, onDelete }) => {
  const [showActions, setShowActions] = useState(false)
  const contentInfo = getContentTypeInfo(upload.contentType)

  return (
    <div
      className="card card-hover group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image Preview */}
      <div className="relative">
        <img
          src={upload.imageUrl}
          alt={upload.title}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-black bg-opacity-70 text-white text-xs rounded-lg">
            {contentInfo.icon} {contentInfo.label}
          </span>
        </div>

        {/* Action buttons overlay */}
        <div className={`
          absolute inset-0 bg-black bg-opacity-50 rounded-t-xl flex items-center justify-center gap-2 transition-opacity duration-200
          ${showActions ? 'opacity-100' : 'opacity-0'}
        `}>
          <Link
            to={`/analysis/${upload._id}`}
            className="btn btn-secondary text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Link>
          <Link
            to={`/chat/${upload._id}`}
            className="btn btn-secondary text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Chat
          </Link>
          <Link
            to={`/videos/${upload._id}`}
            className="btn btn-secondary text-xs"
          >
            <Play className="w-3 h-3 mr-1" />
            Videos
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-sm truncate flex-1 mr-2">
            {upload.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className={`
              p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
              ${showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}
            aria-label="Delete analysis"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {upload.analysis?.summary && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {upload.analysis.summary}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(upload.createdAt)}
          </div>

          {upload.analysis?.keyTopics && upload.analysis.keyTopics.length > 0 && (
            <div className="flex gap-1">
              {upload.analysis.keyTopics.slice(0, 2).map((topic, index) => (
                <span
                  key={index}
                  className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md"
                >
                  {topic}
                </span>
              ))}
              {upload.analysis.keyTopics.length > 2 && (
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                  +{upload.analysis.keyTopics.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadHistory