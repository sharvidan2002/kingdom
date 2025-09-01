export const CONTENT_TYPES = {
  HANDWRITTEN: 'handwritten',
  TEXTBOOK: 'textbook',
  DIAGRAM: 'diagram'
}

export const CONTENT_TYPE_LABELS = {
  [CONTENT_TYPES.HANDWRITTEN]: 'Handwritten Notes',
  [CONTENT_TYPES.TEXTBOOK]: 'Textbook Page',
  [CONTENT_TYPES.DIAGRAM]: 'Diagram'
}

export const CONTENT_TYPE_ICONS = {
  [CONTENT_TYPES.HANDWRITTEN]: '✍️',
  [CONTENT_TYPES.TEXTBOOK]: '📚',
  [CONTENT_TYPES.DIAGRAM]: '📊'
}

export const QUIZ_QUESTION_TYPES = {
  MCQ: 'mcq',
  SHORT_ANSWER: 'short_answer',
  TRUE_FALSE: 'true_false'
}

export const MESSAGE_TYPES = {
  TEXT: 'text',
  MINDMAP: 'mindmap'
}

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    GOOGLE: '/auth/google'
  },
  UPLOAD: {
    ANALYZE: '/upload/analyze',
    MY_UPLOADS: '/upload/my-uploads',
    STATISTICS: '/upload/statistics'
  },
  ANALYSIS: {
    BASE: '/analysis',
    QUIZ: '/quiz',
    FLASHCARDS: '/flashcards',
    MINDMAP: '/mindmap',
    VIDEOS: '/videos',
    YOUTUBE_SEARCH: '/youtube/search'
  },
  CHAT: {
    MESSAGE: '/chat/message',
    HISTORY: '/chat/history',
    MINDMAP: '/chat/mindmap'
  },
  EXPORT: {
    PDF: '/export/pdf',
    DOWNLOAD: '/export/download',
    FLASHCARDS: '/export/flashcards',
    QUIZ: '/export/quiz'
  }
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  UPLOAD: '/upload',
  ANALYSIS: '/analysis',
  CHAT: '/chat',
  VIDEOS: '/videos',
  PROFILE: '/profile'
}

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark'
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50
}

export const VOICE_SETTINGS = {
  DEFAULT_RATE: 1,
  DEFAULT_PITCH: 1,
  DEFAULT_VOLUME: 1,
  MIN_RATE: 0.5,
  MAX_RATE: 2,
  MIN_PITCH: 0,
  MAX_PITCH: 2
}

export const YOUTUBE_CONFIG = {
  EMBED_BASE_URL: 'https://www.youtube.com/embed/',
  THUMBNAIL_BASE_URL: 'https://img.youtube.com/vi/',
  WATCH_BASE_URL: 'https://www.youtube.com/watch?v='
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  FILE_TOO_LARGE: 'File size too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Only image files are allowed.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  ANALYSIS_FAILED: 'Failed to analyze content. Please try again.',
  EXPORT_FAILED: 'Failed to export content. Please try again.'
}

export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'Image uploaded and analyzed successfully!',
  EXPORT_SUCCESS: 'Content exported successfully!',
  CHAT_SUCCESS: 'Message sent successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
}

export const LOADING_MESSAGES = {
  UPLOADING: 'Uploading image...',
  ANALYZING: 'Analyzing content...',
  GENERATING_RESPONSE: 'Generating response...',
  EXPORTING: 'Generating PDF...',
  LOADING: 'Loading...'
}

export const ACCESSIBILITY = {
  ARIA_LABELS: {
    UPLOAD_BUTTON: 'Upload image for analysis',
    CHAT_INPUT: 'Type your question here',
    VOICE_PLAY: 'Play text as speech',
    VOICE_PAUSE: 'Pause speech',
    VOICE_STOP: 'Stop speech',
    EXPORT_PDF: 'Export as PDF',
    DELETE_ANALYSIS: 'Delete this analysis',
    TOGGLE_THEME: 'Toggle dark/light theme'
  },
  SCREEN_READER_MESSAGES: {
    ANALYSIS_COMPLETE: 'Analysis completed. You can now view the results, ask questions, or export the content.',
    EXPORT_READY: 'Export is ready for download.',
    VOICE_PLAYING: 'Speech playback started.',
    VOICE_STOPPED: 'Speech playback stopped.'
  }
}

export default {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
  QUIZ_QUESTION_TYPES,
  MESSAGE_TYPES,
  FILE_LIMITS,
  API_ENDPOINTS,
  ROUTES,
  THEME_OPTIONS,
  PAGINATION,
  VOICE_SETTINGS,
  YOUTUBE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  ACCESSIBILITY
}