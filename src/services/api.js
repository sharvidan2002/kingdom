import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Important for CORS
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url); // Debug log

    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status, response.config.url); // Debug log
    return response
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    const message = error.response?.data?.message || error.message || 'An error occurred'

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status === 404) {
      toast.error('Resource not found')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      toast.error('Network error. Please check your connection and ensure the backend is running.')
    }

    return Promise.reject(error)
  }
)

// Helper function to create FormData for file uploads
export const createFormData = (data) => {
  const formData = new FormData()

  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key])
      } else if (Array.isArray(data[key])) {
        data[key].forEach(item => formData.append(key, item))
      } else {
        formData.append(key, data[key])
      }
    }
  })

  return formData
}

// Helper function for download requests
export const downloadFile = async (url, filename) => {
  try {
    const response = await api.get(url, {
      responseType: 'blob'
    })

    // Create blob URL and trigger download
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)

    return { success: true }
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Failed to download file')
    return { success: false, error: error.message }
  }
}

// Helper function to check API health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 })
    return response.data
  } catch (error) {
    throw new Error('API is not responding')
  }
}

export default api