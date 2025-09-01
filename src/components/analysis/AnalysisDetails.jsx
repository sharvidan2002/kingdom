import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Play,
  Download,
  Share2,
  Volume2,
  VolumeX,
  FileText,
  HelpCircle,
  Layers,
  Brain,
  Youtube,
  Eye,
  Copy,
  Edit3,
  Calendar
} from 'lucide-react'
import { formatDate, getContentTypeInfo, copyToClipboard } from '../../utils/helpers'
import { useVoice } from '../../hooks/useVoice'
import VoicePlayer from '../voice/VoicePlayer'
import QuizQuestions from './QuizQuestions'
import Flashcards from './Flashcards'
import MindMap from './MindMap'
import toast from 'react-hot-toast'

const AnalysisDetails = ({ analysis, onExport }) => {
  const [activeTab, setActiveTab] = useState('summary')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState(analysis.title)
  const { speak, isPlaying, stop } = useVoice()

  const contentInfo = getContentTypeInfo(analysis.contentType)

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, count: analysis.analysis?.quizQuestions?.length },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, count: analysis.analysis?.flashcards?.length },
    { id: 'mindmap', label: 'Mind Map', icon: Brain },
    { id: 'videos', label: 'Videos', icon: Youtube, count: analysis.youtubeVideos?.length }
  ]

  const handleVoiceRead = () => {
    if (isPlaying) {
      stop()
    } else {
      let textToRead = `Analysis: ${analysis.title}. `

      if (analysis.analysis?.summary) {
        textToRead += `Summary: ${analysis.analysis.summary}. `
      }

      if (analysis.analysis?.explanation) {
        textToRead += `Explanation: ${analysis.analysis.explanation}`
      }

      speak(textToRead)
    }
  }

  const handleCopyContent = async () => {
    const content = `
${analysis.title}

Summary:
${analysis.analysis?.summary || 'No summary available'}

Explanation:
${analysis.analysis?.explanation || 'No explanation available'}

Key Topics:
${analysis.analysis?.keyTopics?.join(', ') || 'No key topics'}
    `.trim()

    const success = await copyToClipboard(content)
    if (success) {
      toast.success('Content copied to clipboard!')
    } else {
      toast.error('Failed to copy content')
    }
  }

  const handleTitleEdit = async () => {
    if (isEditingTitle) {
      // Save title (you would implement the API call here)
      setIsEditingTitle(false)
      toast.success('Title updated successfully')
    } else {
      setIsEditingTitle(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Image */}
          <div className="lg:w-1/3">
            <img
              src={analysis.imageUrl}
              alt={analysis.title}
              className="w-full h-64 lg:h-80 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <div className="mt-3 text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                {contentInfo.icon} {contentInfo.label}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-2/3">
            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleEdit()
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false)
                      setNewTitle(analysis.title)
                    }
                  }}
                  autoFocus
                />
              ) : (
                <h1 className="text-2xl font-bold flex-1">{analysis.title}</h1>
              )}
              <button
                onClick={handleTitleEdit}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Edit title"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(analysis.createdAt)}
              </div>
              {analysis.extractedText && (
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {analysis.extractedText.length} characters extracted
                </div>
              )}
            </div>

            {/* Summary */}
            {analysis.analysis?.summary && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analysis.analysis.summary}
                </p>
              </div>
            )}

            {/* Key Topics */}
            {analysis.analysis?.keyTopics && analysis.analysis.keyTopics.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysis.keyTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Link
                to={`/chat/${analysis._id}`}
                className="btn btn-primary flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask Questions
              </Link>

              <Link
                to={`/videos/${analysis._id}`}
                className="btn btn-secondary flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Videos
              </Link>

              <button
                onClick={handleVoiceRead}
                className={`btn flex items-center justify-center ${
                  isPlaying ? 'btn-danger' : 'btn-secondary'
                }`}
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Listen
                  </>
                )}
              </button>

              <button
                onClick={() => onExport && onExport(analysis._id)}
                className="btn btn-secondary flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Voice Player */}
        <div className="mt-6">
          <VoicePlayer analysis={analysis} />
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${activeTab === tab.id
                      ? 'bg-white text-black dark:bg-black dark:text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'summary' && (
            <SummaryTab analysis={analysis} onCopy={handleCopyContent} />
          )}

          {activeTab === 'quiz' && (
            <QuizQuestions
              questions={analysis.analysis?.quizQuestions || []}
              analysisTitle={analysis.title}
            />
          )}

          {activeTab === 'flashcards' && (
            <Flashcards
              flashcards={analysis.analysis?.flashcards || []}
              analysisTitle={analysis.title}
            />
          )}

          {activeTab === 'mindmap' && (
            <MindMap
              data={analysis.analysis?.mindMapData}
              analysisId={analysis._id}
            />
          )}

          {activeTab === 'videos' && (
            <div>
              <div className="text-center mb-4">
                <Link
                  to={`/videos/${analysis._id}`}
                  className="btn btn-primary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View All Videos ({analysis.youtubeVideos?.length || 0})
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const SummaryTab = ({ analysis, onCopy }) => {
  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {analysis.analysis?.summary && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Summary</h3>
            <button
              onClick={onCopy}
              className="btn btn-secondary text-xs flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              Copy All
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysis.analysis.summary}
            </p>
          </div>
        </div>
      )}

      {/* Explanation Section */}
      {analysis.analysis?.explanation && (
        <div>
          <h3 className="font-semibold mb-3">Detailed Explanation</h3>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysis.analysis.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Extracted Text */}
      {analysis.extractedText && (
        <div>
          <h3 className="font-semibold mb-3">Extracted Text</h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
              {analysis.extractedText}
            </pre>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <HelpCircle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <div className="font-bold text-lg">{analysis.analysis?.quizQuestions?.length || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Quiz Questions</div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Layers className="w-6 h-6 mx-auto mb-2 text-green-500" />
          <div className="font-bold text-lg">{analysis.analysis?.flashcards?.length || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Flashcards</div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FileText className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <div className="font-bold text-lg">{analysis.analysis?.keyTopics?.length || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Key Topics</div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Youtube className="w-6 h-6 mx-auto mb-2 text-red-500" />
          <div className="font-bold text-lg">{analysis.youtubeVideos?.length || 0}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisDetails