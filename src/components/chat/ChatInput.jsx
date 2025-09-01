// src/components/chat/ChatInput.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Send, Lightbulb, Brain, HelpCircle } from 'lucide-react'
import { chatService } from '../../services/chat'

const MAX_LEN = 1000

const ChatInput = ({ onSendMessage, disabled, analysisContext }) => {
  const [message, setMessage] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef(null)
  const suggestionsBtnRef = useRef(null)

  const quickQuestions = chatService.getQuickQuestions()
  const mindMapPrompts = chatService.getMindMapPrompts()

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [message])

  // Close suggestions with Escape
  useEffect(() => {
    if (!showSuggestions) return
    const onKey = (e) => {
      if (e.key === 'Escape') setShowSuggestions(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showSuggestions])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim() || disabled) return

    if (!chatService.isValidMessage(message)) {
      // you can surface a toast inside isValidMessage or here if needed
      return
    }

    const sanitizedMessage = chatService.sanitizeMessage(message.trim())
    onSendMessage(sanitizedMessage)
    setMessage('')
    setShowSuggestions(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  const getSuggestionsByCategory = () => ([
    {
      category: 'Quick Questions',
      icon: HelpCircle,
      suggestions: quickQuestions.slice(0, 4)
    },
    {
      category: 'Mind Map Requests',
      icon: Brain,
      suggestions: mindMapPrompts.slice(0, 3)
    }
  ])

  return (
    <div className="relative">
      {/* Suggestions Panel */}
      {showSuggestions && (
        <>
          {/* click-away layer */}
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close suggestions"
            onClick={() => setShowSuggestions(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
          >
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-sm">Suggested Questions</span>
              </div>

              {getSuggestionsByCategory().map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <category.icon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {category.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {category.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Context-aware suggestions */}
              {analysisContext?.analysis?.keyTopics?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      About Your Topics
                    </span>
                  </div>

                  <div className="space-y-1">
                    {analysisContext.analysis.keyTopics.slice(0, 3).map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(`Explain ${topic} in more detail`)}
                        className="w-full text-left p-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Explain &quot;{topic}&quot; in more detail
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your study material..."
            className="textarea resize-none min-h-12 max-h-32 pr-12"
            disabled={disabled}
            rows={1}
            aria-label="Type your message"
          />

          {/* Suggestions Button */}
          <button
            type="button"
            ref={suggestionsBtnRef}
            onClick={() => setShowSuggestions((s) => !s)}
            className={`
              absolute right-2 bottom-2 p-1 rounded-lg transition-colors
              ${showSuggestions
                ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
            title="Show suggestions"
            aria-expanded={showSuggestions}
            aria-controls="chat-suggestions"
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          {/* Character Counter */}
          <div className="absolute -bottom-6 right-0 text-xs text-gray-400">
            {message.length}/{MAX_LEN}
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="btn btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Action Buttons */}
      {!message && !disabled && (
        <div className="flex flex-wrap gap-2 mt-3">
          {quickQuestions.slice(0, 3).map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(question)}
              className="btn btn-secondary text-xs"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Typing indicator */}
      {disabled && (
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>AI is thinking...</span>
        </div>
      )}
    </div>
  )
}

export default ChatInput
