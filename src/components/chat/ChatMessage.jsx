import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Bot, User, Copy, Volume2, VolumeX, Brain } from 'lucide-react'
import { chatService } from '../../services/chat'
import { useVoice } from '../../hooks/useVoice'
import { copyToClipboard } from '../../utils/helpers'
import MindMap from '../analysis/MindMap'
import toast from 'react-hot-toast'

const ChatMessage = ({ message, onMindMapGenerated }) => {
  const [showMindMap, setShowMindMap] = useState(false)
  const { speak, isPlaying, stop } = useVoice()

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content)
    if (success) {
      toast.success('Message copied to clipboard')
    } else {
      toast.error('Failed to copy message')
    }
  }

  const handleVoiceRead = () => {
    if (isPlaying) {
      stop()
    } else {
      speak(message.content)
    }
  }

  const mindMapData = chatService.extractMindMapData(message)

  const handleShowMindMap = () => {
    if (mindMapData) {
      setShowMindMap(true)
      if (onMindMapGenerated) {
        onMindMapGenerated(mindMapData)
      }
    }
  }

  return (
    <div className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white dark:text-black" />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={`
        max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-4 shadow-sm
        ${message.isUser
          ? 'bg-black text-white dark:bg-white dark:text-black ml-auto'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
        }
      `}>
        {/* Message content */}
        <div className="space-y-2">
          {message.type === 'mindmap' && mindMapData ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4" />
                <span className="font-medium text-sm">Mind Map Generated</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-3">
                <MindMap data={mindMapData} analysisId={analysisId} className="h-64" />
              </div>

              <button
                onClick={handleShowMindMap}
                className="btn btn-secondary text-xs w-full"
              >
                <Brain className="w-3 h-3 mr-1" />
                View Full Mind Map
              </button>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                  code: ({ children }) => (
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto text-sm">
                      {children}
                    </pre>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Timestamp */}
          <div className={`
            text-xs mt-2
            ${message.isUser
              ? 'text-gray-300 dark:text-gray-600'
              : 'text-gray-500 dark:text-gray-400'
            }
          `}>
            {message.formattedTimestamp}
          </div>
        </div>

        {/* Message Actions */}
        {!message.isUser && (
          <div className="flex gap-1 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Copy message"
            >
              <Copy className="w-3 h-3" />
            </button>

            <button
              onClick={handleVoiceRead}
              className={`
                p-1 rounded transition-colors
                ${isPlaying
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }
              `}
              title={isPlaying ? 'Stop reading' : 'Read aloud'}
            >
              {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>

            {mindMapData && (
              <button
                onClick={handleShowMindMap}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="View mind map"
              >
                <Brain className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {message.isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      )}

      {/* Mind Map Modal */}
      {showMindMap && mindMapData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl h-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Mind Map</h3>
              <button
                onClick={() => setShowMindMap(false)}
                className="btn btn-secondary text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex-1 p-4">
              <MindMap data={mindMapData} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatMessage