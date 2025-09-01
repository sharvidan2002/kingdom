import api from './api'

export const analysisService = {
  async getAnalysis(id) {
    const response = await api.get(`/analysis/${id}`)
    return response.data
  },

  async getAllAnalyses(page = 1, limit = 10, contentType = null, search = null) {
    const params = new URLSearchParams({ page, limit })
    if (contentType) params.append('contentType', contentType)
    if (search) params.append('search', search)

    const response = await api.get(`/analysis?${params}`)
    return response.data
  },

  async getQuizQuestions(id) {
    const response = await api.get(`/analysis/${id}/quiz`)
    return response.data
  },

  async getFlashcards(id) {
    const response = await api.get(`/analysis/${id}/flashcards`)
    return response.data
  },

  async getMindMap(id) {
    const response = await api.get(`/analysis/${id}/mindmap`)
    return response.data
  },

  async getYoutubeVideos(id) {
    const response = await api.get(`/analysis/${id}/videos`)
    return response.data
  },

  async refreshYoutubeVideos(id) {
    const response = await api.post(`/analysis/${id}/videos/refresh`)
    return response.data
  },

  async searchYoutubeVideos(query) {
    const response = await api.get(`/analysis/youtube/search?query=${encodeURIComponent(query)}`)
    return response.data
  },

  async getAnalysisStatistics() {
    const response = await api.get('/analysis/statistics')
    return response.data
  },

  async updateAnalysisTitle(id, title) {
    const response = await api.put(`/analysis/${id}/title`, { title })
    return response.data
  },

  async getPopularTopics() {
    const response = await api.get('/analysis/popular-topics')
    return response.data
  },

  formatQuizQuestion(question, index) {
    const questionNumber = index + 1

    switch (question.type) {
      case 'mcq':
        return {
          ...question,
          formattedQuestion: `${questionNumber}. ${question.question}`,
          formattedOptions: question.options?.map((option, optIndex) =>
            `${String.fromCharCode(65 + optIndex)}. ${option}`
          ) || []
        }

      case 'short_answer':
        return {
          ...question,
          formattedQuestion: `${questionNumber}. ${question.question}`
        }

      case 'true_false':
        return {
          ...question,
          formattedQuestion: `${questionNumber}. ${question.question}`,
          formattedOptions: ['True', 'False']
        }

      default:
        return {
          ...question,
          formattedQuestion: `${questionNumber}. ${question.question}`
        }
    }
  },

  calculateQuizScore(answers, questions) {
    let correct = 0
    const results = []

    questions.forEach((question, index) => {
      const userAnswer = answers[index]
      let isCorrect = false

      if (question.type === 'mcq') {
        isCorrect = userAnswer === question.correct
      } else if (question.type === 'true_false') {
        isCorrect = userAnswer === question.correct
      } else if (question.type === 'short_answer') {
        // Simple text comparison for short answers
        const correctAnswer = question.answer?.toLowerCase().trim()
        const userAnswerLower = userAnswer?.toLowerCase().trim()
        isCorrect = correctAnswer === userAnswerLower
      }

      if (isCorrect) correct++

      results.push({
        questionIndex: index,
        userAnswer,
        correctAnswer: question.correct || question.answer,
        isCorrect
      })
    })

    return {
      score: correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      results
    }
  },

  getScoreColor(percentage) {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  },

  getScoreMessage(percentage) {
    if (percentage >= 90) return 'Excellent work! 🎉'
    if (percentage >= 80) return 'Great job! 👏'
    if (percentage >= 70) return 'Good effort! 👍'
    if (percentage >= 60) return 'Keep practicing! 💪'
    return 'Review the material and try again! 📚'
  }
}

export default analysisService