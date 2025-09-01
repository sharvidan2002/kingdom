import React, { useEffect, useRef } from 'react'
import { X, ExternalLink, Share2, Clock, Eye, Calendar } from 'lucide-react'
import { formatNumber, formatDate, getYouTubeEmbedUrl, copyToClipboard } from '../../utils/helpers'
import { YOUTUBE_CONFIG } from '../../utils/constants'
import toast from 'react-hot-toast'

const VideoPlayer = ({ video, onClose, relatedVideos = [], onVideoSelect }) => {
  const playerRef = useRef(null)

  useEffect(() => {
    // Focus management for accessibility
    if (playerRef.current) {
      playerRef.current.focus()
    }

    // Escape key to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleShare = async () => {
    const shareUrl = `${YOUTUBE_CONFIG.WATCH_BASE_URL}${video.videoId}`
    const success = await copyToClipboard(shareUrl)

    if (success) {
      toast.success('Video URL copied to clipboard!')
    } else {
      toast.error('Failed to copy URL')
    }
  }

  const handleExternalOpen = () => {
    window.open(`${YOUTUBE_CONFIG.WATCH_BASE_URL}${video.videoId}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        ref={playerRef}
        tabIndex={-1}
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl max-h-full overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="font-semibold truncate">{video.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{video.channelTitle}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="btn btn-secondary text-sm flex items-center gap-2"
              title="Share video"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleExternalOpen}
              className="btn btn-secondary text-sm flex items-center gap-2"
              title="Open in YouTube"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">YouTube</span>
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary text-sm"
              title="Close player"
              aria-label="Close video player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Video Player */}
          <div className="lg:w-2/3">
            <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
              <iframe
                src={getYouTubeEmbedUrl(video.videoId)}
                title={video.title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 lg:border-b-0">
              <h3 className="font-semibold mb-2">{video.title}</h3>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                {video.views && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatNumber(video.views)} views
                  </div>
                )}

                {video.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {video.duration}
                  </div>
                )}

                {video.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.publishedAt)}
                  </div>
                )}
              </div>

              {video.description && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Description</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {video.description.length > 300
                      ? `${video.description.substring(0, 300)}...`
                      : video.description
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related Videos Sidebar */}
          {relatedVideos.length > 0 && (
            <div className="lg:w-1/3 border-l-0 lg:border-l border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <h4 className="font-semibold mb-4">Related Videos</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                  {relatedVideos.map((relatedVideo, index) => (
                    <div
                      key={relatedVideo.videoId || index}
                      onClick={() => onVideoSelect && onVideoSelect(relatedVideo)}
                      className="flex gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={relatedVideo.thumbnail}
                          alt={relatedVideo.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded flex items-center justify-center">
                          <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>

                        {relatedVideo.duration && (
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                            {relatedVideo.duration}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {relatedVideo.title}
                        </h5>

                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                          {relatedVideo.channelTitle}
                        </p>

                        {relatedVideo.views && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Eye className="w-3 h-3" />
                            {formatNumber(relatedVideo.views)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer