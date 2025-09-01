import api, { downloadFile } from './api'
import { saveAs } from 'file-saver'

export const exportService = {
  async exportToPDF(analysisId) {
    const response = await api.post(`/export/pdf/${analysisId}`)
    return response.data
  },

  async exportMultipleAnalyses(analysisIds) {
    const response = await api.post('/export/pdf/multiple', {
      analysisIds
    })
    return response.data
  },

  async exportFlashcards(analysisId) {
    const response = await api.post(`/export/flashcards/${analysisId}`)
    return response.data
  },

  async exportQuizQuestions(analysisId) {
    const response = await api.post(`/export/quiz/${analysisId}`)
    return response.data
  },

  async downloadPDF(filename) {
    return downloadFile(`/export/download/${filename}`, filename)
  },

  async getExportHistory() {
    const response = await api.get('/export/history')
    return response.data
  },

  async deleteExport(filename) {
    const response = await api.delete(`/export/${filename}`)
    return response.data
  },

  async exportAndDownload(analysisId, type = 'full') {
    try {
      let response

      switch (type) {
        case 'flashcards':
          response = await this.exportFlashcards(analysisId)
          break
        case 'quiz':
          response = await this.exportQuizQuestions(analysisId)
          break
        default:
          response = await this.exportToPDF(analysisId)
      }

      if (response.success && response.downloadUrl) {
        // Trigger download
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.download = response.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        return { success: true, filename: response.filename }
      }

      throw new Error('Export failed')
    } catch (error) {
      console.error('Export and download error:', error)
      throw error
    }
  },

  async exportMultipleAndDownload(analysisIds) {
    try {
      const response = await this.exportMultipleAnalyses(analysisIds)

      if (response.success && response.downloadUrl) {
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.download = response.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        return { success: true, filename: response.filename }
      }

      throw new Error('Export failed')
    } catch (error) {
      console.error('Multiple export error:', error)
      throw error
    }
  },

  formatExportSize(size) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  },

  getExportTypeIcon(type) {
    switch (type) {
      case 'flashcards':
        return '🃏'
      case 'quiz':
        return '❓'
      case 'multiple':
        return '📚'
      default:
        return '📄'
    }
  },

  getExportTypeLabel(type) {
    switch (type) {
      case 'flashcards':
        return 'Flashcards Only'
      case 'quiz':
        return 'Quiz Questions Only'
      case 'multiple':
        return 'Combined Material'
      default:
        return 'Study Material'
    }
  }
}

export default exportService