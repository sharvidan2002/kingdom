import React from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Play,
  Download,
  Calendar,
  FileText,
  HelpCircle,
  Layers,
  Volume2,
  Share2
} from 'lucide-react'
import { formatDate, getContentTypeInfo } from '../../utils/helpers'
import { useVoice } from '../../hooks/useVoice'

const AnalysisCard = ({ analysis, onExport, onShare, className = '' }) => {
  const { speak, isPlaying, stop } = useVoice()
  const contentInfo = getContentTypeInfo(analysis.contentType)

  const handleVoiceRead = () => {
    if (isPlaying) {
      stop()
    } else {
      const textToRead = `${analysis.title}. Summary: ${analysis.analysis?.summary || 'No summary available'}`
      speak(textToRead)
    }
  }

  const stats = [
    {
      label: 'Questions',
      value: analysis.analysis?.quizQuestions?.length || 0,
      icon: HelpCircle
    },
    {
      label: 'Flashcards',
      value: analysis.analysis?.flashcards?.length || 0,
      icon: Layers
    },
    {
      label: 'Key Topics',
      value: analysis.analysis?.keyTopics?.length || 0,
      icon: FileText
    }
  ]

  return (
    <div className={`card hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{contentInfo.icon}</span>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {contentInfo.label}
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-1 truncate">{analysis.title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              {formatDate(analysis.createdAt)}
            </div>
          </div>

          <div className="flex gap-1 ml-2">
            <button
              onClick={handleVoiceRead}
              className={`p-2 rounded-lg transition-colors ${
                isPlaying
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
              }`}
              aria-label={isPlaying ? 'Stop reading' : 'Read aloud'}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {onShare && (
              <button
                onClick={() => onShare(analysis)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Share analysis"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {analysis.imageUrl && (
        <div className="relative">
          <img
            src={analysis.imageUrl}
            alt={analysis.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Summary */}
        {analysis.analysis?.summary && (
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2">Summary</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {analysis.analysis.summary}
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-1">
                <stat.icon className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Key Topics */}
        {analysis.analysis?.keyTopics && analysis.analysis.keyTopics.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2">Key Topics</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.analysis.keyTopics.slice(0, 3).map((topic, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md"
                >
                  {topic}
                </span>
              ))}
              {analysis.analysis.keyTopics.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{analysis.analysis.keyTopics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/analysis/${analysis._id}`}
            className="btn btn-secondary text-xs flex items-center justify-center"
          >
            <FileText className="w-3 h-3 mr-1" />
            View Details
          </Link>

          <Link
            to={`/chat/${analysis._id}`}
            className="btn btn-secondary text-xs flex items-center justify-center"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Ask Questions
          </Link>

          <Link
            to={`/videos/${analysis._id}`}
            className="btn btn-secondary text-xs flex items-center justify-center"
          >
            <Play className="w-3 h-3 mr-1" />
            Watch Videos
          </Link>

          <button
            onClick={() => onExport && onExport(analysis._id)}
            className="btn btn-secondary text-xs flex items-center justify-center"
          >
            <Download className="w-3 h-3 mr-1" />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnalysisCard