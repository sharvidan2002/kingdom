import api, { createFormData } from './api'

export const uploadService = {
  async uploadAndAnalyze(file, prompt, contentType, title) {
    const formData = createFormData({
      image: file,
      prompt,
      contentType,
      title
    })

    // Set content type to multipart/form-data for file upload
    const response = await api.post('/upload/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 seconds for analysis
    })

    return response.data
  },

  async getUserUploads(page = 1, limit = 10, contentType = null) {
    const params = new URLSearchParams({ page, limit })
    if (contentType) {
      params.append('contentType', contentType)
    }

    const response = await api.get(`/upload/my-uploads?${params}`)
    return response.data
  },

  async getUploadDetails(id) {
    const response = await api.get(`/upload/${id}`)
    return response.data
  },

  async deleteUpload(id) {
    const response = await api.delete(`/upload/${id}`)
    return response.data
  },

  async retryAnalysis(id, prompt) {
    const response = await api.post(`/upload/${id}/retry`, { prompt })
    return response.data
  },

  async getUploadStatistics() {
    const response = await api.get('/upload/statistics')
    return response.data
  },

  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.')
    }

    return true
  },

  getFilePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        resolve(e.target.result)
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsDataURL(file)
    })
  },

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  getContentTypeIcon(contentType) {
    switch (contentType) {
      case 'handwritten':
        return '✍️'
      case 'textbook':
        return '📚'
      case 'diagram':
        return '📊'
      default:
        return '📄'
    }
  },

  getContentTypeLabel(contentType) {
    switch (contentType) {
      case 'handwritten':
        return 'Handwritten Notes'
      case 'textbook':
        return 'Textbook Page'
      case 'diagram':
        return 'Diagram'
      default:
        return 'Unknown'
    }
  }
}

export default uploadService