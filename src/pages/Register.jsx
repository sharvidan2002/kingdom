import React from 'react'
import { useNavigate } from 'react-router-dom'
import RegisterForm from '../components/auth/RegisterForm'

const Register = () => {
  const navigate = useNavigate()

  const handleRegisterSuccess = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  )
}

export default Register