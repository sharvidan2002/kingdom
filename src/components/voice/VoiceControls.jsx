import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, Gauge, Waves, Save } from 'lucide-react'
import { useVoice } from '../../hooks/useVoice'
import { voiceService } from '../../services/voice'
import toast from 'react-hot-toast'

const VoiceControls = ({ className = '' }) => {
  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    speak,
    stop
  } = useVoice()

  const [settings, setSettings] = useState({
    rate: 1,
    pitch: 1,
    volume: 1,
    voiceIndex: 0
  })

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = voiceService.getVoiceSettings()
    setSettings(savedSettings)

    if (voices.length > 0) {
      const voice = voices[savedSettings.voiceIndex] || voices[0]
      setSelectedVoice(voice)
    }

    setRate(savedSettings.rate)
    setPitch(savedSettings.pitch)
    setVolume(savedSettings.volume)
  }, [voices, setSelectedVoice, setRate, setPitch, setVolume])

  const handleVoiceChange = (voiceIndex) => {
    const voice = voices[voiceIndex]
    if (voice) {
      setSelectedVoice(voice)
      setSettings(prev => ({ ...prev, voiceIndex }))
    }
  }

  const handleRateChange = (newRate) => {
    setRate(newRate)
    setSettings(prev => ({ ...prev, rate: newRate }))
  }

  const handlePitchChange = (newPitch) => {
    setPitch(newPitch)
    setSettings(prev => ({ ...prev, pitch: newPitch }))
  }

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume)
    setSettings(prev => ({ ...prev, volume: newVolume }))
  }

  const handleSaveSettings = () => {
    voiceService.saveVoiceSettings(settings)
    toast.success('Voice settings saved!')
  }

  const handleTestVoice = () => {
    stop() // Stop any current speech
    speak('This is a test of the current voice settings. How does this sound?', {
      voice: selectedVoice,
      rate,
      pitch,
      volume
    })
  }

  const handleResetSettings = () => {
    const defaultSettings = {
      rate: 1,
      pitch: 1,
      volume: 1,
      voiceIndex: 0
    }

    setSettings(defaultSettings)
    setRate(1)
    setPitch(1)
    setVolume(1)

    if (voices.length > 0) {
      setSelectedVoice(voices[0])
    }

    toast.success('Settings reset to defaults')
  }

  const getVoiceDisplayName = (voice) => {
    // Clean up voice names for better display
    let name = voice.name

    // Remove common prefixes/suffixes
    name = name.replace(/^(Microsoft|Google|Apple)\s*/i, '')
    name = name.replace(/\s*(Online|Desktop|Enhanced|Premium)\s*/gi, ' ')
    name = name.trim()

    return `${name} (${voice.lang})`
  }

  const getVoicesByLanguage = () => {
    const grouped = {}

    voices.forEach((voice, index) => {
      const lang = voice.lang.split('-')[0] // Get language code without region
      if (!grouped[lang]) {
        grouped[lang] = []
      }
      grouped[lang].push({ ...voice, index })
    })

    // Sort languages, prioritizing English
    const sortedLanguages = Object.keys(grouped).sort((a, b) => {
      if (a === 'en') return -1
      if (b === 'en') return 1
      return a.localeCompare(b)
    })

    return sortedLanguages.map(lang => ({
      language: lang,
      displayName: new Intl.DisplayNames(['en'], { type: 'language' }).of(lang) || lang,
      voices: grouped[lang]
    }))
  }

  const voiceGroups = getVoicesByLanguage()
  const selectedVoiceIndex = voices.findIndex(v => v === selectedVoice)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          <h3 className="font-semibold">Voice Settings</h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleTestVoice}
            className="btn btn-secondary text-sm"
          >
            Test Voice
          </button>

          <button
            onClick={handleSaveSettings}
            className="btn btn-primary text-sm flex items-center gap-2"
          >
            <Save className="w-3 h-3" />
            Save
          </button>
        </div>
      </div>

      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Voice</label>
        <select
          value={selectedVoiceIndex}
          onChange={(e) => handleVoiceChange(parseInt(e.target.value))}
          className="input text-sm"
        >
          {voiceGroups.map((group) => (
            <optgroup key={group.language} label={group.displayName}>
              {group.voices.map((voice) => (
                <option key={voice.index} value={voice.index}>
                  {getVoiceDisplayName(voice)}
                  {voice.localService ? ' (Offline)' : ' (Online)'}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {selectedVoice && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {selectedVoice.localService ? 'This voice works offline' : 'This voice requires internet connection'}
          </div>
        )}
      </div>

      {/* Speed Control */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Reading Speed: {rate}x
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">Slow</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">Fast</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <button onClick={() => handleRateChange(0.75)} className="hover:text-gray-600 dark:hover:text-gray-300">0.75x</button>
          <button onClick={() => handleRateChange(1)} className="hover:text-gray-600 dark:hover:text-gray-300">1x</button>
          <button onClick={() => handleRateChange(1.25)} className="hover:text-gray-600 dark:hover:text-gray-300">1.25x</button>
          <button onClick={() => handleRateChange(1.5)} className="hover:text-gray-600 dark:hover:text-gray-300">1.5x</button>
        </div>
      </div>

      {/* Pitch Control */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Voice Pitch: {pitch}
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">Low</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">High</span>
        </div>
      </div>

      {/* Volume Control */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Volume: {Math.round(volume * 100)}%
        </label>
        <div className="flex items-center gap-3">
          <VolumeX className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <Volume2 className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Reading Content Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">What to Read</label>
        <div className="space-y-2">
          {readingOptions.map((option) => (
            <label key={option.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="readingMode"
                value={option.id}
                checked={readingMode === option.id}
                onChange={(e) => setReadingMode(e.target.value)}
                className="w-4 h-4"
                disabled={isPlaying}
              />
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleResetSettings}
          className="btn btn-secondary text-sm flex-1"
        >
          Reset to Default
        </button>

        <button
          onClick={handleTestVoice}
          className="btn btn-secondary text-sm flex-1"
        >
          Test Settings
        </button>
      </div>

      {/* Accessibility Information */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-sm mb-1 text-blue-800 dark:text-blue-200">
          Accessibility Feature
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          This text-to-speech feature is designed to help visually impaired users and those who learn better through audio.
          All study content can be read aloud with customizable voice settings.
        </p>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p className="font-medium mb-1">Keyboard Shortcuts:</p>
        <div className="grid grid-cols-2 gap-2">
          <p><kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> Play/Pause</p>
          <p><kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">S</kbd> Stop</p>
          <p><kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">←</kbd> Rewind</p>
          <p><kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">→</kbd> Fast Forward</p>
        </div>
      </div>
    </div>
  )
}

export default VoiceControls