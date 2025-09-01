import React, { useState } from 'react'
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, Settings } from 'lucide-react'
import VoiceControls from './VoiceControls'
import { useVoice } from '../../hooks/useVoice'
import { voiceService } from '../../services/voice'

const VoicePlayer = ({ analysis, className = '' }) => {
  const [showSettings, setShowSettings] = useState(false)
  const [readingMode, setReadingMode] = useState('summary') // 'summary', 'explanation', 'full'
  const [isReading, setIsReading] = useState(false)

  const {
    speak,
    pause,
    resume,
    stop,
    rewind,
    fastForward,
    isPlaying,
    isPaused,
    currentText,
    selectedVoice,
    rate,
    pitch,
    volume
  } = useVoice()

  const readingOptions = [
    {
      id: 'summary',
      label: 'Summary Only',
      description: 'Read just the summary'
    },
    {
      id: 'explanation',
      label: 'Summary + Explanation',
      description: 'Read summary and detailed explanation'
    },
    {
      id: 'full',
      label: 'Everything',
      description: 'Read summary, explanation, and key points'
    }
  ]

  const getTextToRead = () => {
    let text = `Reading analysis: ${analysis.title}. `

    if (readingMode === 'summary' && analysis.analysis?.summary) {
      text += `Summary: ${analysis.analysis.summary}`
    } else if (readingMode === 'explanation') {
      if (analysis.analysis?.summary) {
        text += `Summary: ${analysis.analysis.summary}. `
      }
      if (analysis.analysis?.explanation) {
        text += `Detailed explanation: ${analysis.analysis.explanation}`
      }
    } else if (readingMode === 'full') {
      if (analysis.analysis?.summary) {
        text += `Summary: ${analysis.analysis.summary}. `
      }
      if (analysis.analysis?.explanation) {
        text += `Explanation: ${analysis.analysis.explanation}. `
      }
      if (analysis.analysis?.keyTopics?.length > 0) {
        text += `Key topics include: ${analysis.analysis.keyTopics.join(', ')}`
      }
    }

    return voiceService.formatTextForSpeech(text)
  }

  const handlePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    } else {
      const textToRead = getTextToRead()
      setIsReading(true)

      speak(textToRead, {
        onStart: () => setIsReading(true),
        onEnd: () => setIsReading(false),
        onError: () => setIsReading(false)
      })
    }
  }

  const handleStop = () => {
    stop()
    setIsReading(false)
  }

  const estimatedDuration = voiceService.getReadingEstimate(getTextToRead())

  if (!voiceService.isSupported()) {
    return (
      <div className={`card p-4 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Text-to-speech is not supported in your browser</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`voice-player rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          <div>
            <h3 className="font-medium text-sm">Audio Playback</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isReading ? 'Reading content aloud' : `Estimated ${estimatedDuration}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn btn-secondary text-sm"
          title="Voice settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Reading Mode Selection */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-2">Reading Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {readingOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setReadingMode(option.id)}
              className={`
                p-2 text-xs rounded-lg border-2 transition-all duration-200
                ${readingMode === option.id
                  ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              disabled={isPlaying}
              title={option.description}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Current Text Display */}
      {isPlaying && currentText && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Currently reading: "{currentText.substring(0, 100)}..."
          </p>
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={rewind}
          disabled={!isPlaying}
          className="btn btn-secondary p-2 disabled:opacity-50"
          title="Rewind"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={handlePlay}
          className="btn btn-primary p-3"
          title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
        >
          {isPlaying && !isPaused ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={handleStop}
          disabled={!isPlaying}
          className="btn btn-secondary p-2 disabled:opacity-50"
          title="Stop"
        >
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={fastForward}
          disabled={!isPlaying}
          className="btn btn-secondary p-2 disabled:opacity-50"
          title="Fast forward"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Voice Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <VoiceControls />
        </div>
      )}

      {/* Accessibility Note */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>This feature helps visually impaired users access study content through audio</p>
      </div>
    </div>
  )
}

export default VoicePlayer