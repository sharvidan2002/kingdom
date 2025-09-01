import React from 'react'

const LoadingSpinner = ({
  size = 'md',
  text = null,
  className = '',
  color = 'current'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    current: 'border-current',
    black: 'border-black dark:border-white',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  const spinnerClass = `loading-spinner ${sizeClasses[size]} ${colorClasses[color]} ${className}`

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={spinnerClass} />
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      </div>
    )
  }

  return <div className={spinnerClass} />
}

export const FullPageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 flex items-center justify-center z-50">
      <LoadingSpinner size="xl" text={text} />
    </div>
  )
}

export const InlineLoader = ({ text = 'Loading...', className = '' }) => {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export const ButtonLoader = ({ size = 'sm' }) => {
  return (
    <LoadingSpinner
      size={size}
      color="white"
      className="mr-2"
    />
  )
}

export default LoadingSpinner