export const voiceService = {
  isSupported() {
    return 'speechSynthesis' in window
  },

  getVoices() {
    return speechSynthesis.getVoices()
  },

  getPreferredVoice() {
    const voices = this.getVoices()
    // Try to find a good English voice
    return voices.find(voice =>
      voice.lang.startsWith('en') && voice.localService
    ) || voices[0]
  },

  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Stop any current speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Set options
      utterance.voice = options.voice || this.getPreferredVoice()
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 1

      // Event handlers
      utterance.onstart = () => {
        if (options.onStart) options.onStart()
      }

      utterance.onend = () => {
        if (options.onEnd) options.onEnd()
        resolve()
      }

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event)
        if (options.onError) options.onError(event)
        reject(event)
      }

      utterance.onpause = () => {
        if (options.onPause) options.onPause()
      }

      utterance.onresume = () => {
        if (options.onResume) options.onResume()
      }

      speechSynthesis.speak(utterance)
    })
  },

  pause() {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause()
    }
  },

  resume() {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
    }
  },

  stop() {
    speechSynthesis.cancel()
  },

  isPlaying() {
    return speechSynthesis.speaking
  },

  isPaused() {
    return speechSynthesis.paused
  },

  async readAnalysis(analysis, options = {}) {
    const {
      includeSummary = true,
      includeExplanation = true,
      includeQuestions = false,
      includeFlashcards = false
    } = options

    let textToRead = `Reading analysis for: ${analysis.title}. `

    if (includeSummary && analysis.analysis?.summary) {
      textToRead += `Summary: ${analysis.analysis.summary}. `
    }

    if (includeExplanation && analysis.analysis?.explanation) {
      textToRead += `Explanation: ${analysis.analysis.explanation}. `
    }

    if (includeQuestions && analysis.analysis?.quizQuestions?.length > 0) {
      textToRead += `Quiz questions: `
      analysis.analysis.quizQuestions.forEach((question, index) => {
        textToRead += `Question ${index + 1}: ${question.question}. `
        if (question.type === 'mcq' && question.options) {
          question.options.forEach((option, optIndex) => {
            textToRead += `Option ${String.fromCharCode(65 + optIndex)}: ${option}. `
          })
        }
      })
    }

    if (includeFlashcards && analysis.analysis?.flashcards?.length > 0) {
      textToRead += `Flashcards: `
      analysis.analysis.flashcards.forEach((card, index) => {
        textToRead += `Card ${index + 1}: ${card.front}. Answer: ${card.back}. `
      })
    }

    return this.speak(textToRead, options)
  },

  async readText(text, options = {}) {
    if (!text || text.trim().length === 0) {
      throw new Error('No text to read')
    }

    return this.speak(text, options)
  },

  formatTextForSpeech(text) {
    return text
      .replace(/\n+/g, '. ') // Replace line breaks with pauses
      .replace(/[*#_`]/g, '') // Remove markdown formatting
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  },

  getVoiceSettings() {
    const saved = localStorage.getItem('voiceSettings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing voice settings:', error)
      }
    }

    return {
      rate: 1,
      pitch: 1,
      volume: 1,
      voiceIndex: 0
    }
  },

  saveVoiceSettings(settings) {
    try {
      localStorage.setItem('voiceSettings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving voice settings:', error)
    }
  },

  getReadingEstimate(text) {
    // Estimate reading time based on average speech rate
    const wordsPerMinute = 150
    const words = text.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)

    if (minutes < 1) return 'Less than 1 minute'
    if (minutes === 1) return '1 minute'
    return `${minutes} minutes`
  }
}

export default voiceService