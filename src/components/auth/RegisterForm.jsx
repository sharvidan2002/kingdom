import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { validateEmail, validatePassword, getPasswordStrength } from '../../utils/validation'
import { FormFieldError } from '../common/ErrorMessage'
import { ButtonLoader } from '../common/LoadingSpinner'

const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long'
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters with uppercase, lowercase, and number'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const result = await register(formData.name.trim(), formData.email, formData.password)

      if (result.success) {
        if (onSuccess) onSuccess()
      }
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleRegister = () => {
    window.location.href = '/api/auth/google'
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white dark:text-black font-bold text-xl">AI</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join thousands of students enhancing their learning with AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input pl-10 ${errors.name ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
            </div>
            <FormFieldError error={errors.name} />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input pl-10 ${errors.email ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>
            <FormFieldError error={errors.email} />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input pl-10 pr-10 ${errors.password ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="Create a password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <FormFieldError error={errors.password} />

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength >= 80 ? 'bg-green-500' :
                        passwordStrength.strength >= 60 ? 'bg-yellow-500' :
                        passwordStrength.strength >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {passwordStrength.message}
                  </span>
                </div>
                {passwordStrength.feedback && passwordStrength.feedback.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {passwordStrength.feedback.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <FormFieldError error={errors.confirmPassword} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn btn-primary flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <ButtonLoader />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Registration */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isSubmitting}
            className="w-full btn btn-secondary flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>
        </form>

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-black dark:text-white hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm