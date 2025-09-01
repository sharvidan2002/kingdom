import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image, FileText, BarChart3, Eye } from 'lucide-react'
import { validateFile } from '../../utils/validation'
import { formatFileSize, getImageDimensions } from '../../utils/helpers'
import ErrorMessage from '../common/ErrorMessage'

const ImageUpload = ({
  onFileSelect,
  selectedFile,
  onFileRemove,
  disabled = false,
  contentType = 'handwritten'
}) => {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError(null)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors.some(err => err.code === 'file-too-large')) {
        setError('File size too large. Maximum size is 10MB.')
      } else if (rejection.errors.some(err => err.code === 'file-invalid-type')) {
        setError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.')
      } else {
        setError('File upload failed. Please try again.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Validate file
      const validationErrors = validateFile(file)
      if (validationErrors.length > 0) {
        setError(validationErrors[0])
        return
      }

      try {
        // Get image dimensions
        const dimensions = await getImageDimensions(file)

        // Create preview URL
        const preview = URL.createObjectURL(file)
        setPreviewUrl(preview)

        // Set file info
        setFileInfo({
          name: file.name,
          size: file.size,
          type: file.type,
          dimensions
        })

        // Call parent callback
        onFileSelect(file)
      } catch (error) {
        console.error('Error processing file:', error)
        setError('Failed to process image. Please try again.')
      }
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setFileInfo(null)
    setError(null)
    if (onFileRemove) onFileRemove()
  }

  const getContentTypeInfo = () => {
    switch (contentType) {
      case 'handwritten':
        return {
          icon: FileText,
          title: 'Handwritten Notes',
          description: 'Upload photos of your handwritten notes, lecture notes, or personal study materials'
        }
      case 'textbook':
        return {
          icon: Image,
          title: 'Textbook Pages',
          description: 'Upload pages from textbooks, academic papers, or printed materials'
        }
      case 'diagram':
        return {
          icon: BarChart3,
          title: 'Diagrams & Charts',
          description: 'Upload diagrams, flowcharts, graphs, or visual learning materials'
        }
      default:
        return {
          icon: Upload,
          title: 'Study Material',
          description: 'Upload any study-related image for AI analysis'
        }
    }
  }

  const contentInfo = getContentTypeInfo()
  const ContentIcon = contentInfo.icon

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <ErrorMessage
          error={error}
          onDismiss={() => setError(null)}
          variant="error"
        />
      )}

      {/* Upload Area */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive || dragActive
              ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-800'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ContentIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">{contentInfo.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {contentInfo.description}
              </p>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop your image here' : 'Drag and drop an image, or click to browse'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supports JPEG, PNG, GIF, WebP up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && previewUrl && (
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-sm truncate">{fileInfo?.name}</h4>
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileInfo?.size || 0)}
                    </p>
                    {fileInfo?.dimensions && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {fileInfo.dimensions.width} × {fileInfo.dimensions.height} pixels
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleRemoveFile}
                  disabled={disabled}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* File quality indicator */}
              <div className="mt-3">
                <FileQualityIndicator file={selectedFile} />
              </div>
            </div>
          </div>

          {/* Preview actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => window.open(previewUrl, '_blank')}
              className="btn btn-secondary text-xs flex items-center gap-2"
            >
              <Eye className="w-3 h-3" />
              Full Size
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Component to show file quality indicators
const FileQualityIndicator = ({ file }) => {
  const [quality, setQuality] = useState(null)

  React.useEffect(() => {
    if (!file) return

    const checkQuality = async () => {
      try {
        const dimensions = await getImageDimensions(file)
        const fileSize = file.size

        let qualityScore = 0
        const indicators = []

        // Size check
        if (fileSize > 2 * 1024 * 1024) { // > 2MB
          qualityScore += 1
          indicators.push('High resolution')
        } else if (fileSize > 500 * 1024) { // > 500KB
          qualityScore += 0.5
          indicators.push('Medium resolution')
        } else {
          indicators.push('Low resolution')
        }

        // Dimension check
        if (dimensions.width >= 1920 && dimensions.height >= 1080) {
          qualityScore += 1
          indicators.push('Excellent clarity')
        } else if (dimensions.width >= 1280 && dimensions.height >= 720) {
          qualityScore += 0.5
          indicators.push('Good clarity')
        } else {
          indicators.push('Basic clarity')
        }

        setQuality({
          score: qualityScore,
          indicators,
          level: qualityScore >= 1.5 ? 'excellent' : qualityScore >= 1 ? 'good' : 'fair'
        })
      } catch (error) {
        console.error('Error checking file quality:', error)
      }
    }

    checkQuality()
  }, [file])

  if (!quality) return null

  const getQualityColor = () => {
    switch (quality.level) {
      case 'excellent': return 'text-green-600 dark:text-green-400'
      case 'good': return 'text-yellow-600 dark:text-yellow-400'
      default: return 'text-orange-600 dark:text-orange-400'
    }
  }

  const getQualityIcon = () => {
    switch (quality.level) {
      case 'excellent': return '✓'
      case 'good': return '○'
      default: return '!'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium ${getQualityColor()}`}>
        {getQualityIcon()} Quality: {quality.level}
      </span>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {quality.indicators.join(' • ')}
      </div>
    </div>
  )
}

export default ImageUpload