import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  async getProfile(token) {
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data.user
  },

  async updateProfile(userData, token) {
    const response = await api.put('/auth/profile', userData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data.user
  },

  async changePassword(currentPassword, newPassword, token) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  async deleteAccount(token) {
    const response = await api.delete('/auth/account', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  getGoogleAuthUrl() {
    return '/api/auth/google'
  },

  handleGoogleCallback(token) {
    if (token) {
      localStorage.setItem('token', token)
      return true
    }
    return false
  }
}

export default authService