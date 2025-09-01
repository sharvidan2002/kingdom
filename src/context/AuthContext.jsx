import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      }

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }

    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const user = await authService.getProfile(token)
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token }
          })
        }
      } catch (error) {
        // Token might be expired or invalid
        localStorage.removeItem('token')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await authService.login(email, password)

      // Store token
      localStorage.setItem('token', response.token)

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      })

      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await authService.register(name, email, password)

      // Store token
      localStorage.setItem('token', response.token)

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response
      })

      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData, state.token)
      dispatch({ type: 'UPDATE_USER', payload: updatedUser })
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword, state.token)
      toast.success('Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const deleteAccount = async () => {
    try {
      await authService.deleteAccount(state.token)
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
      toast.success('Account deleted successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Account deletion failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default AuthContext