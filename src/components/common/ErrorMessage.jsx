import React from 'react'
import { AlertTriangle, X, RefreshCw } from 'lucide-react'

const ErrorMessage = ({
  error,
  title = 'Something went wrong',
  showIcon = true,
  showRetry = false,
  onRetry,
  onDismiss,
  className = '',
  variant = 'error'
}) => {
  const variants = {
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
  }

  const iconColors = {
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    info: 'text-blue-500 dark:text-blue-400'
  }

  if (!error) return null

  const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred'

  return (
    <div className={`rounded-lg border p-4 ${variants[variant]} ${className}`}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0">
            <AlertTriangle className={`h-5 w-5 ${iconColors[variant]}`} />
          </div>
        )}

        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          <h3 className="text-sm font-medium">
            {title}
          </h3>

          {errorMessage && (
            <div className="mt-1 text-sm opacity-90">
              {errorMessage}
            </div>
          )}

          {showRetry && onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </button>
            </div>
          )}
        </div>

        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 hover:bg-red-100 dark:hover:bg-red-800 transition-colors ${iconColors[variant]}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const InlineError = ({ error, className = '' }) => {
  if (!error) return null

  return (
    <p className={`text-red-500 dark:text-red-400 text-sm mt-1 ${className}`}>
      {typeof error === 'string' ? error : error.message}
    </p>
  )
}

export const FormFieldError = ({ error }) => {
  if (!error) return null

  return (
    <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center">
      <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
      {error}
    </p>
  )
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}

      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}

export const NetworkError = ({ onRetry }) => {
  return (
    <ErrorMessage
      error="Unable to connect to the server. Please check your internet connection."
      title="Connection Error"
      variant="error"
      showRetry={!!onRetry}
      onRetry={onRetry}
      showIcon={true}
    />
  )
}

export const NotFoundError = ({
  title = 'Not Found',
  message = 'The requested resource could not be found.',
  actionText = 'Go Back',
  onAction
}) => {
  return (
    <EmptyState
      icon={<AlertTriangle className="w-full h-full" />}
      title={title}
      description={message}
      action={
        onAction && (
          <button
            onClick={onAction}
            className="btn btn-primary"
          >
            {actionText}
          </button>
        )
      }
    />
  )
}

export default ErrorMessage