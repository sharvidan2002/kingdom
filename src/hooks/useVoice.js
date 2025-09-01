import { useState, useEffect, useRef, useCallback } from 'react'

export function useVoice() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)

  const utteranceRef = useRef(null)
  const queueRef = useRef([])
  const currentIndexRef = useRef(0)

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)

      // Set default voice (prefer English voices)
      if (availableVoices.length > 0 && !selectedVoice) {
        const englishVoice = availableVoices.find(voice =>
          voice.lang.startsWith('en') && voice.localService
        ) || availableVoices[0]
        setSelectedVoice(englishVoice)
      }
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      speechSynthesis.onvoiceschanged = null
    }
  }, [selectedVoice])

  const speak = useCallback((text, options = {}) => {
    if (!text || text.trim().length === 0) return

    // Stop any current speech
    stop()

    const {
      voice = selectedVoice,
      rate: customRate = rate,
      pitch: customPitch = pitch,
      volume: customVolume = volume,
      onStart,
      onEnd,
      onError
    } = options

    // Split text into chunks for better control
    const chunks = splitTextIntoChunks(text, 200)
    queueRef.current = chunks
    currentIndexRef.current = 0

    const speakChunk = (chunkIndex) => {
      if (chunkIndex >= chunks.length) {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentText('')
        if (onEnd) onEnd()
        return
      }

      const chunk = chunks[chunkIndex]
      const utterance = new SpeechSynthesisUtterance(chunk)

      utterance.voice = voice
      utterance.rate = customRate
      utterance.pitch = customPitch
      utterance.volume = customVolume

      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
        setCurrentText(chunk)
        if (chunkIndex === 0 && onStart) onStart()
      }

      utterance.onend = () => {
        currentIndexRef.current = chunkIndex + 1
        speakChunk(chunkIndex + 1)
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        setIsPlaying(false)
        setIsPaused(false)
        if (onError) onError(event)
      }

      utteranceRef.current = utterance
      speechSynthesis.speak(utterance)
    }

    speakChunk(0)
  }, [selectedVoice, rate, pitch, volume])

  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [])

  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentText('')
    queueRef.current = []
    currentIndexRef.current = 0
    utteranceRef.current = null
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      if (isPaused) {
        resume()
      } else {
        pause()
      }
    }
  }, [isPlaying, isPaused, pause, resume])

  const rewind = useCallback(() => {
    if (queueRef.current.length > 0) {
      const currentIndex = Math.max(0, currentIndexRef.current - 1)
      stop()

      // Restart from previous chunk
      setTimeout(() => {
        const remainingChunks = queueRef.current.slice(currentIndex)
        if (remainingChunks.length > 0) {
          speak(remainingChunks.join(' '))
        }
      }, 100)
    }
  }, [speak, stop])

  const fastForward = useCallback(() => {
    if (queueRef.current.length > 0) {
      const currentIndex = Math.min(queueRef.current.length - 1, currentIndexRef.current + 1)
      stop()

      // Start from next chunk
      setTimeout(() => {
        const remainingChunks = queueRef.current.slice(currentIndex)
        if (remainingChunks.length > 0) {
          speak(remainingChunks.join(' '))
        }
      }, 100)
    }
  }, [speak, stop])

  const setVoiceSettings = useCallback((settings) => {
    if (settings.voice !== undefined) setSelectedVoice(settings.voice)
    if (settings.rate !== undefined) setRate(settings.rate)
    if (settings.pitch !== undefined) setPitch(settings.pitch)
    if (settings.volume !== undefined) setVolume(settings.volume)
  }, [])

  const isSupported = 'speechSynthesis' in window

  return {
    speak,
    pause,
    resume,
    stop,
    toggle,
    rewind,
    fastForward,
    isPlaying,
    isPaused,
    currentText,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    setVoiceSettings,
    isSupported
  }
}

// Helper function to split text into manageable chunks
function splitTextIntoChunks(text, maxLength = 200) {
  if (text.length <= maxLength) return [text]

  const chunks = []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

  let currentChunk = ''

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue

    if (currentChunk.length + trimmedSentence.length + 2 <= maxLength) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.')
      }
      currentChunk = trimmedSentence
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk + '.')
  }

  return chunks.length > 0 ? chunks : [text]
}

export default useVoice