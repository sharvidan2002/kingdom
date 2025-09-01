import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner'
import toast from 'react-hot-toast'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        toast.error('Authentication failed. Please try again.')
        navigate('/login')
        return
      }

      if (token) {
        try {
          // Store token and fetch user profile
          localStorage.setItem('token', token)

          // Redirect to dashboard
          navigate('/dashboard')
          toast.success('Successfully logged in!')
        } catch (error) {
          console.error('Auth callback error:', error)
          toast.error('Authentication failed. Please try again.')
          navigate('/login')
        }
      } else {
        toast.error('No authentication token received')
        navigate('/login')
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" text="Completing authentication..." />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Please wait while we sign you in
        </p>
      </div>
    </div>
  )
}

export default AuthCallback