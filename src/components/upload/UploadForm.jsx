import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Sparkles, FileText, Image, BarChart3 } from 'lucide-react'
import ImageUpload from './ImageUpload'
import { uploadService } from '../../services/upload'
import { FormFieldError } from '../common/ErrorMessage'
import { ButtonLoader } from '../common/LoadingSpinner'
import { CONTENT_TYPES } from '../../utils/constants'
import toast from 'react-hot-toast'

const UploadForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    contentType: CONTENT_TYPES.HANDWRITTEN
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  const contentTypeOptions = [
    {
      value: CONTENT_TYPES.HANDWRITTEN,
      label: 'Handwritten Notes',
      icon: FileText,
      description: 'Lecture notes, personal notes, or handwritten materials',
      examples: ['Class notes', 'Study notes', 'Homework']
    },
    {
      value: CONTENT_TYPES.TEXTBOOK,
      label: 'Textbook Page',
      icon: Image,
      description: 'Pages from textbooks, academic papers, or printed materials',
      examples: ['Textbook chapters', 'Research papers', 'Study guides']
    },
    {
      value: CONTENT_TYPES.DIAGRAM,
      label: 'Diagram',
      icon: BarChart3,
      description: 'Charts, diagrams, flowcharts, or visual learning materials',
      examples: ['Flow charts', 'Mind maps', 'Scientific diagrams']
    }
  ]

  const promptSuggestions = {
    [CONTENT_TYPES.HANDWRITTEN]: [
      'Create a summary and quiz questions from my notes',
      'Help me understand the key concepts in these notes',
      'Generate flashcards from this content',
      'Explain the main topics covered in my notes'
    ],
    [CONTENT_TYPES.TEXTBOOK]: [
      'Summarize this textbook page and create study questions',
      'Break down the complex concepts into simple explanations',
      'Create a comprehensive study guide from this material',
      'Generate practice questions for exam preparation'
    ],
    [CONTENT_TYPES.DIAGRAM]: [
      'Explain this diagram and its components',
      'Help me understand the relationships shown in this diagram',
      'Create questions about this visual content',
      'Break down the process or system shown here'
    ]
  }

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

  const handleContentTypeChange = (contentType) => {
    setFormData(prev => ({
      ...prev,
      contentType,
      prompt: '' // Clear prompt when content type changes
    }))
  }

  const handlePromptSuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      prompt: suggestion
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = 'Prompt is required'
    } else if (formData.prompt.trim().length < 5) {
      newErrors.prompt = 'Prompt must be at least 5 characters long'
    }

    if (!selectedFile) {
      newErrors.file = 'Please select an image file'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsUploading(true)

    try {
      const result = await uploadService.uploadAndAnalyze(
        selectedFile,
        formData.prompt.trim(),
        formData.contentType,
        formData.title.trim()
      )

      if (result.success) {
        toast.success('Analysis completed successfully!')
        navigate(`/analysis/${result.analysis.id}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Upload Study Material</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transform your study materials with AI-powered analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Content Type</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contentTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleContentTypeChange(option.value)}
                className={`
                  p-4 border-2 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]
                  ${formData.contentType === option.value
                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                disabled={isUploading}
              >
                <div className="flex items-center gap-3 mb-2">
                  <option.icon className="w-5 h-5" />
                  <span className="font-medium">{option.label}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {option.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {option.examples.map((example, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-3">Upload Image</label>
          <ImageUpload
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
            onFileRemove={() => setSelectedFile(null)}
            disabled={isUploading}
            contentType={formData.contentType}
          />
          <FormFieldError error={errors.file} />
        </div>

        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`input ${errors.title ? 'border-red-300 dark:border-red-600' : ''}`}
            placeholder="Give your study material a descriptive title"
            disabled={isUploading}
          />
          <FormFieldError error={errors.title} />
        </div>

        {/* Prompt Field */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            What would you like AI to help you with?
          </label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            rows={3}
            className={`textarea ${errors.prompt ? 'border-red-300 dark:border-red-600' : ''}`}
            placeholder="Describe what you want to learn or what kind of analysis you need..."
            disabled={isUploading}
          />
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {formData.prompt.length}/500 characters
          </div>
          <FormFieldError error={errors.prompt} />

          {/* Prompt Suggestions */}
          {promptSuggestions[formData.contentType] && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions[formData.contentType].map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePromptSuggestion(suggestion)}
                    className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
                    disabled={isUploading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full btn btn-primary flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <ButtonLoader />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </button>

          {isUploading && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              This may take a few moments while AI processes your content
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default UploadForm