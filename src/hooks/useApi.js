import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token, logout } = useAuth()

  const makeRequest = useCallback(async (apiCall, options = {}) => {
    const {
      showSuccess = false,
      showError = true,
      successMessage = 'Operation successful',
      onSuccess,
      onError
    } = options

    try {
      setLoading(true)
      setError(null)

      const result = await apiCall()

      if (showSuccess) {
        toast.success(successMessage)
      }

      if (onSuccess) {
        onSuccess(result)
      }

      return { success: true, data: result }
    } catch (err) {
      console.error('API Error:', err)

      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      setError(errorMessage)

      // Handle authentication errors
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        logout()
        return { success: false, error: errorMessage }
      }

      if (showError) {
        toast.error(errorMessage)
      }

      if (onError) {
        onError(err)
      }

      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [token, logout])

  const get = useCallback((url, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(`/api${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    }, options)
  }, [makeRequest, token])

  const post = useCallback((url, data, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(`/api${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    }, options)
  }, [makeRequest, token])

  const put = useCallback((url, data, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(`/api${url}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    }, options)
  }, [makeRequest, token])

  const del = useCallback((url, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(`/api${url}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    }, options)
  }, [makeRequest, token])

  const uploadFile = useCallback((url, formData, options = {}) => {
    return makeRequest(async () => {
      const response = await fetch(`/api${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    }, options)
  }, [makeRequest, token])

  return {
    loading,
    error,
    get,
    post,
    put,
    del,
    uploadFile,
    makeRequest
  }
}

export default useApi