import React from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'

const Login = () => {
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  )
}

export default Login