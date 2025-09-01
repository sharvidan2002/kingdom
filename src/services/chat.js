import api from './api'

export const chatService = {
  async sendMessage(message, analysisId) {
    const response = await api.post('/chat/message', {
      message,
      analysisId
    })
    return response.data
  },

  async getChatHistory(analysisId) {
    const response = await api.get(`/chat/history/${analysisId}`)
    return response.data
  },

  async clearChatHistory(analysisId) {
    const response = await api.delete(`/chat/history/${analysisId}`)
    return response.data
  },

  async deleteChat(analysisId) {
    const response = await api.delete(`/chat/${analysisId}`)
    return response.data
  },

  async getChatStatistics() {
    const response = await api.get('/chat/statistics')
    return response.data
  },

  async generateMindMap(analysisId, customPrompt = null) {
    const response = await api.post(`/chat/mindmap/${analysisId}`, {
      customPrompt
    })
    return response.data
  },

  async getMessagesByType(analysisId, type) {
    const response = await api.get(`/chat/history/${analysisId}/messages?type=${type}`)
    return response.data
  },

  async updateMessage(chatId, messageId, content) {
    const response = await api.put(`/chat/${chatId}/message/${messageId}`, {
      content
    })
    return response.data
  },

  async deleteMessage(chatId, messageId) {
    const response = await api.delete(`/chat/${chatId}/message/${messageId}`)
    return response.data
  },

  formatMessage(message) {
    return {
      ...message,
      formattedTimestamp: new Date(message.timestamp).toLocaleTimeString(),
      isUser: message.role === 'user',
      isAssistant: message.role === 'assistant'
    }
  },

  formatChatHistory(messages) {
    return messages.map(this.formatMessage)
  },

  extractMindMapData(message) {
    if (message.type === 'mindmap' && message.mindMapData) {
      return message.mindMapData
    }

    // Try to parse JSON from content
    try {
      const parsed = JSON.parse(message.content)
      if (parsed.type === 'mindmap' && parsed.data) {
        return parsed.data
      }
    } catch (error) {
      // Not JSON, return null
    }

    return null
  },

  getMindMapPrompts() {
    return [
      'Create a mind map of the main concepts',
      'Show me the relationships between different topics',
      'Generate a concept map for better understanding',
      'Create a visual overview of the key points',
      'Map out the important connections in this material'
    ]
  },

  getQuickQuestions() {
    return [
      'Explain this in simpler terms',
      'What are the key takeaways?',
      'Give me examples of these concepts',
      'How does this relate to other topics?',
      'What should I focus on most?',
      'Create practice questions for me',
      'Summarize the most important points'
    ]
  },

  isValidMessage(message) {
    return message &&
           typeof message === 'string' &&
           message.trim().length > 0 &&
           message.trim().length <= 1000
  },

  sanitizeMessage(message) {
    return message.trim().slice(0, 1000)
  }
}

export default chatService