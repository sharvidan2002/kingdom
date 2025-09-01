import React from 'react'
import { Play, Clock, Eye, Calendar, ExternalLink } from 'lucide-react'
import { formatNumber, truncateText, formatDate } from '../../utils/helpers'
import { YOUTUBE_CONFIG } from '../../utils/constants'

const VideoCard = ({ video, onClick, viewMode = 'grid' }) => {
  const handleClick = () => {
    if (onClick) onClick(video)
  }

  const handleExternalClick = (e) => {
    e.stopPropagation()
    window.open(`${YOUTUBE_CONFIG.WATCH_BASE_URL}${video.videoId}`, '_blank')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="card p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
        role="button"
        aria-label={`Play video: ${video.title}`}
      >
        <div className="flex gap-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-40 h-24 object-cover rounded-lg"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>

            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {video.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
              {video.channelTitle}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
              {video.views && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatNumber(video.views)} views
                </div>
              )}

              {video.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(video.publishedAt)}
                </div>
              )}
            </div>

            {video.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {truncateText(video.description, 120)}
              </p>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleClick}
                className="btn btn-primary text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Watch Here
              </button>

              <button
                onClick={handleExternalClick}
                className="btn btn-secondary text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                YouTube
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="card overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
      role="button"
      aria-label={`Play video: ${video.title}`}
    >
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}

        {/* Views badge */}
        {video.views && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatNumber(video.views)}
          </div>
        )}

        {/* External link button */}
        <button
          onClick={handleExternalClick}
          className="absolute top-2 right-2 p-2 bg-black bg-opacity-80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100"
          title="Open in YouTube"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">
          {video.channelTitle}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {video.duration || 'Unknown'}
          </div>

          {video.publishedAt && (
            <div>
              {formatDate(video.publishedAt)}
            </div>
          )}
        </div>

        {/* Description preview */}
        {video.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {truncateText(video.description, 100)}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleClick}
            className="btn btn-primary text-xs flex-1"
          >
            <Play className="w-3 h-3 mr-1" />
            Watch Here
          </button>

          <button
            onClick={handleExternalClick}
            className="btn btn-secondary text-xs"
            title="Open in YouTube"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoCard