import { FILE_LIMITS } from './constants'

export const validationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },

  password: {
    required: 'Password is required',
    minLength: {
      value: 6,
      message: 'Password must be at least 6 characters long'
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },

  name: {
    required: 'Name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters long'
    },
    maxLength: {
      value: 50,
      message: 'Name must not exceed 50 characters'
    }
  },

  title: {
    required: 'Title is required',
    minLength: {
      value: 3,
      message: 'Title must be at least 3 characters long'
    },
    maxLength: {
      value: 100,
      message: 'Title must not exceed 100 characters'
    }
  },

  prompt: {
    required: 'Prompt is required',
    minLength: {
      value: 5,
      message: 'Prompt must be at least 5 characters long'
    },
    maxLength: {
      value: 500,
      message: 'Prompt must not exceed 500 characters'
    }
  },

  chatMessage: {
    required: 'Message is required',
    minLength: {
      value: 1,
      message: 'Message cannot be empty'
    },
    maxLength: {
      value: 1000,
      message: 'Message must not exceed 1000 characters'
    }
  }
}

export const validateFile = (file) => {
  const errors = []

  if (!file) {
    errors.push('Please select a file')
    return errors
  }

  // Check file type
  if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
    errors.push('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
  }

  // Check file size
  if (file.size > FILE_LIMITS.MAX_SIZE) {
    const maxSizeMB = FILE_LIMITS.MAX_SIZE / (1024 * 1024)
    errors.push(`File size too large. Maximum size is ${maxSizeMB}MB.`)
  }

  return errors
}

export const validateForm = (data, rules) => {
  const errors = {}

  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field]
    const value = data[field]

    // Required validation
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = fieldRules.required
      return
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return
    }

    // Min length validation
    if (fieldRules.minLength && value.length < fieldRules.minLength.value) {
      errors[field] = fieldRules.minLength.message
      return
    }

    // Max length validation
    if (fieldRules.maxLength && value.length > fieldRules.maxLength.value) {
      errors[field] = fieldRules.maxLength.message
      return
    }

    // Pattern validation
    if (fieldRules.pattern && !fieldRules.pattern.value.test(value)) {
      errors[field] = fieldRules.pattern.message
      return
    }

    // Custom validation
    if (fieldRules.custom) {
      const customError = fieldRules.custom(value, data)
      if (customError) {
        errors[field] = customError
        return
      }
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

export const validateEmail = (email) => {
  return validationRules.email.pattern.value.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6 && validationRules.password.pattern.value.test(password)
}

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, message: 'Enter a password' }

  let score = 0
  const feedback = []

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Use at least 8 characters')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add lowercase letters')
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add uppercase letters')
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Add numbers')
  }

  // Special character check
  if (/[@$!%*?&]/.test(password)) {
    score += 1
  } else {
    feedback.push('Add special characters')
  }

  const strengthLevels = {
    0: { strength: 0, message: 'Very weak', color: 'red' },
    1: { strength: 20, message: 'Weak', color: 'red' },
    2: { strength: 40, message: 'Fair', color: 'orange' },
    3: { strength: 60, message: 'Good', color: 'yellow' },
    4: { strength: 80, message: 'Strong', color: 'green' },
    5: { strength: 100, message: 'Very strong', color: 'green' }
  }

  return {
    ...strengthLevels[score],
    feedback: feedback.slice(0, 2) // Show only top 2 suggestions
  }
}

export const validateContentType = (contentType) => {
  const validTypes = ['handwritten', 'textbook', 'diagram']
  return validTypes.includes(contentType)
}

export const validateAnalysisId = (id) => {
  // MongoDB ObjectId validation
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export const formatValidationError = (error) => {
  if (typeof error === 'string') return error

  if (error.response?.data?.errors) {
    return error.response.data.errors.map(err => err.message).join(', ')
  }

  if (error.response?.data?.message) {
    return error.response.data.message
  }

  return error.message || 'Validation failed'
}

export const createValidationSchema = (fields) => {
  const schema = {}

  fields.forEach(field => {
    if (validationRules[field]) {
      schema[field] = validationRules[field]
    }
  })

  return schema
}

export default {
  validationRules,
  validateFile,
  validateForm,
  sanitizeInput,
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateContentType,
  validateAnalysisId,
  formatValidationError,
  createValidationSchema
}