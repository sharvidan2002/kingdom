import { CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS } from './constants'

export const formatDate = (date) => {
  if (!date) return ''

  const now = new Date()
  const targetDate = new Date(date)
  const diffInMs = now - targetDate
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return targetDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffInDays === 1) {
    return 'Yesterday'
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`
  } else {
    return targetDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength).trim() + '...'
}

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const getContentTypeInfo = (contentType) => {
  return {
    label: CONTENT_TYPE_LABELS[contentType] || 'Unknown',
    icon: CONTENT_TYPE_ICONS[contentType] || '📄'
  }
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

export const downloadTextAsFile = (text, filename, mimeType = 'text/plain') => {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password) => {
  // At least 6 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
  return passwordRegex.test(password)
}

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return num.toString()
  }
}

export const generateColor = (str) => {
  // Generate a consistent color based on string
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 50%)`
}

export const extractKeywords = (text, maxKeywords = 5) => {
  if (!text) return []

  // Simple keyword extraction
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'would', 'there', 'could', 'other'].includes(word))

  // Count word frequency
  const wordCount = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  // Return top keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height
      })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const { width, height } = img
      const ratio = Math.min(maxWidth / width, maxWidth / height)

      canvas.width = width * ratio
      canvas.height = height * ratio

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(resolve, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

export const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const parseYouTubeVideoId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export const getYouTubeEmbedUrl = (videoId) => {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
}

export const getYouTubeThumbnail = (videoId, quality = 'mqdefault') => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

export default {
  formatDate,
  formatFileSize,
  truncateText,
  generateId,
  debounce,
  throttle,
  capitalizeFirst,
  getContentTypeInfo,
  copyToClipboard,
  downloadTextAsFile,
  isValidEmail,
  isValidPassword,
  formatNumber,
  generateColor,
  extractKeywords,
  scrollToTop,
  scrollToElement,
  getImageDimensions,
  compressImage,
  createSlug,
  parseYouTubeVideoId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnail
}