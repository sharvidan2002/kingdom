import React, { useState, useEffect, useRef } from 'react'
import { Brain, Trash2, Download, Volume2, MessageSquare, X } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import MindMap from '../analysis/MindMap'
import { chatService } from '../../services/chat'
import { useVoice } from '../../hooks/useVoice'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage, { EmptyState } from '../common/ErrorMessage'
import toast from 'react-hot-toast'

const ChatInterface = ({ analysisId, analysis }) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [showMindMap, setShowMindMap] = useState(false)
  const [mindMapData, setMindMapData] = useState(null)
  const messagesEndRef = useRef(null)
  const { speak, isPlaying, stop } = useVoice()

  useEffect(() => {
    fetchChatHistory()
  }, [analysisId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await chatService.getChatHistory(analysisId)

      if (result.success) {
        setMessages(chatService.formatChatHistory(result.messages))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (message) => {
    try {
      setSending(true)
      setError(null)

      // Add user message to UI immediately
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        type: 'text'
      }

      setMessages(prev => [...prev, chatService.formatMessage(userMessage)])

      // Send to API
      const result = await chatService.sendMessage(message, analysisId)

      if (result.success) {
        const aiMessage = chatService.formatMessage(result.response)
        setMessages(prev => [...prev, aiMessage])

        // Check if response contains mind map data
        if (result.response.type === 'mindmap' && result.response.mindMapData) {
          setMindMapData(result.response.mindMapData)
          setShowMindMap(true)
        }
      }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to send message')

      // Remove the user message that was added optimistically
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear the chat history?')) {
      return
    }

    try {
      await chatService.clearChatHistory(analysisId)
      setMessages([])
      setMindMapData(null)
      setShowMindMap(false)
      toast.success('Chat history cleared')
    } catch (error) {
      toast.error('Failed to clear chat history')
    }
  }

  const handleGenerateMindMap = async () => {
    try {
      setSending(true)
      const result = await chatService.generateMindMap(analysisId)

      if (result.success && result.mindMapData) {
        setMindMapData(result.mindMapData)
        setShowMindMap(true)
        toast.success('Mind map generated!')
      }
    } catch (error) {
      toast.error('Failed to generate mind map')
    } finally {
      setSending(false)
    }
  }

  const handleExportChat = () => {
    const chatContent = messages
      .map(msg => `${msg.isUser ? 'You' : 'AI'}: ${msg.content}`)
      .join('\n\n')

    const blob = new Blob([chatContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chat-${analysis?.title || 'analysis'}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const readLastMessage = () => {
    const lastAiMessage = [...messages].reverse().find(msg => msg.isAssistant)
    if (lastAiMessage) {
      if (isPlaying) {
        stop()
      } else {
        speak(lastAiMessage.content)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading chat..." />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title="Failed to load chat"
        showRetry={true}
        onRetry={fetchChatHistory}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div>
          <h2 className="font-semibold">AI Study Assistant</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ask questions about "{analysis?.title}"
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerateMindMap}
            disabled={sending}
            className="btn btn-secondary text-sm flex items-center gap-2"
            title="Generate Mind Map"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Mind Map</span>
          </button>

          {messages.length > 0 && (
            <>
              <button
                onClick={readLastMessage}
                className={`btn btn-secondary text-sm ${isPlaying ? 'bg-blue-100 dark:bg-blue-900/20' : ''}`}
                title="Read last response"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportChat}
                className="btn btn-secondary text-sm"
                title="Export chat"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleClearChat}
                className="btn btn-secondary text-sm text-red-600 dark:text-red-400"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mind Map Modal */}
      {showMindMap && mindMapData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl h-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold">Generated Mind Map</h3>
              <button
                onClick={() => setShowMindMap(false)}
                className="btn btn-secondary text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex-1 p-4">
              <MindMap data={mindMapData} analysisId={analysisId} />
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
        {messages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-full h-full" />}
            title="Start a Conversation"
            description="Ask questions about your study material. I can help explain concepts, create quizzes, or generate mind maps."
            action={
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {chatService.getQuickQuestions().slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(question)}
                    className="btn btn-secondary text-sm"
                    disabled={sending}
                  >
                    {question}
                  </button>
                ))}
              </div>
            }
          />
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              onMindMapGenerated={(data) => {
                setMindMapData(data)
                setShowMindMap(true)
              }}
            />
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-xs shadow-sm">
              <LoadingSpinner size="sm" text="AI is thinking..." />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={sending}
          analysisContext={analysis}
        />
      </div>
    </div>
  )
}

export default ChatInterface