import React, { useState } from 'react'
import { Play, Search, RefreshCw, Grid, List } from 'lucide-react'
import VideoCard from './VideoCard'
import VideoPlayer from './VideoPlayer'
import { analysisService } from '../../services/analysis'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage, { EmptyState } from '../common/ErrorMessage'
import toast from 'react-hot-toast'

const VideoGrid = ({ analysisId, videos = [], keyTopics = [], onRefresh }) => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleVideoSelect = (video) => {
    setSelectedVideo(video)
  }

  const handleClosePlayer = () => {
    setSelectedVideo(null)
  }

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    try {
      setSearching(true)
      const result = await analysisService.searchYoutubeVideos(searchQuery.trim())

      if (result.success) {
        setSearchResults(result.videos)
        toast.success(`Found ${result.videos.length} videos`)
      }
    } catch (error) {
      toast.error('Failed to search videos')
      console.error('Video search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleRefreshVideos = async () => {
    if (!onRefresh) return

    try {
      setRefreshing(true)
      await onRefresh()
      toast.success('Videos refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh videos')
    } finally {
      setRefreshing(false)
    }
  }

  const displayVideos = searchResults.length > 0 ? searchResults : videos
  const hasVideos = displayVideos.length > 0

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Educational Videos</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {searchResults.length > 0
              ? `${searchResults.length} search results for "${searchQuery}"`
              : `${videos.length} videos related to your study material`
            }
          </p>
        </div>

        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 text-sm ${viewMode === 'grid'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 text-sm ${viewMode === 'list'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={handleRefreshVideos}
              disabled={refreshing}
              className="btn btn-secondary flex items-center gap-2"
              title="Refresh videos"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for educational videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
              disabled={searching}
            />
          </div>

          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {searching ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Clear search results */}
        {searchResults.length > 0 && (
          <button
            onClick={() => {
              setSearchResults([])
              setSearchQuery('')
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
          >
            Clear
          </button>
        )}
      </form>

      {/* Key Topics Quick Search */}
      {keyTopics.length > 0 && !searchResults.length && (
        <div>
          <h3 className="font-medium text-sm mb-2">Quick search by topic:</h3>
          <div className="flex flex-wrap gap-2">
            {keyTopics.slice(0, 5).map((topic, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(topic)
                  handleSearch({ preventDefault: () => {} })
                }}
                className="btn btn-secondary text-xs"
                disabled={searching}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Grid/List */}
      {!hasVideos ? (
        <EmptyState
          icon={<Play className="w-full h-full" />}
          title="No Videos Found"
          description={searchQuery
            ? `No videos found for "${searchQuery}". Try different keywords.`
            : "No educational videos are available for this content. Try searching for specific topics."
          }
          action={
            !searchQuery && keyTopics.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery(keyTopics[0])
                  handleSearch({ preventDefault: () => {} })
                }}
                className="btn btn-primary"
              >
                Search for "{keyTopics[0]}"
              </button>
            )
          }
        />
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'video-grid'
            : 'space-y-4'
        }>
          {displayVideos.map((video, index) => (
            <VideoCard
              key={video.videoId || index}
              video={video}
              onClick={() => handleVideoSelect(video)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
          relatedVideos={displayVideos.filter(v => v.videoId !== selectedVideo.videoId).slice(0, 6)}
          onVideoSelect={handleVideoSelect}
        />
      )}

      {/* Loading States */}
      {searching && (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" text="Searching for videos..." />
        </div>
      )}

      {refreshing && (
        <div className="text-center py-4">
          <LoadingSpinner size="md" text="Refreshing video recommendations..." />
        </div>
      )}
    </div>
  )
}

export default VideoGrid