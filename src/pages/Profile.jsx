import React, { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Calendar,
  Settings,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  BarChart3,
  FileText,
  MessageSquare,
  Save
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { analysisService } from '../services/analysis'
import { exportService } from '../services/export'
import { validateEmail, validatePassword, getPasswordStrength } from '../utils/validation'
import { FormFieldError } from '../components/common/ErrorMessage'
import LoadingSpinner, { InlineLoader } from '../components/common/LoadingSpinner'
import ErrorMessage from '../components/common/ErrorMessage'
import VoiceControls from '../components/voice/VoiceControls'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUserStatistics()
  }, [])

  const fetchUserStatistics = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await analysisService.getAnalysisStatistics()

      if (result.success) {
        setStatistics(result.statistics)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'voice', label: 'Voice Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  if (loading) {
    return <InlineLoader text="Loading profile..." />
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title="Failed to load profile"
        showRetry={true}
        onRetry={fetchUserStatistics}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-white dark:text-black" />
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>

          {statistics && (
            <div className="text-right">
              <div className="text-2xl font-bold">{statistics.totalAnalyses || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Analyses</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-1 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileTab user={user} onUpdate={updateProfile} />
          )}

          {activeTab === 'statistics' && (
            <StatisticsTab statistics={statistics} />
          )}

          {activeTab === 'voice' && (
            <VoiceTab />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              user={user}
              onChangePassword={changePassword}
              onDeleteAccount={deleteAccount}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const ProfileTab = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)

    try {
      const result = await onUpdate(formData)
      if (result.success) {
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input ${errors.name ? 'border-red-300 dark:border-red-600' : ''}`}
          disabled={saving}
        />
        <FormFieldError error={errors.name} />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`input ${errors.email ? 'border-red-300 dark:border-red-600' : ''}`}
          disabled={saving}
        />
        <FormFieldError error={errors.email} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn btn-primary flex items-center gap-2"
      >
        {saving ? (
          <LoadingSpinner size="sm" color="white" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  )
}

const StatisticsTab = ({ statistics }) => {
  const stats = [
    {
      label: 'Total Analyses',
      value: statistics?.totalAnalyses || 0,
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Quiz Questions',
      value: statistics?.totalQuizQuestions || 0,
      icon: MessageSquare,
      color: 'green'
    },
    {
      label: 'Flashcards',
      value: statistics?.totalFlashcards || 0,
      icon: Brain,
      color: 'purple'
    },
    {
      label: 'Handwritten Notes',
      value: statistics?.handwrittenCount || 0,
      icon: FileText,
      color: 'orange'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Your Learning Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-500`} />
              <div className="font-bold text-2xl">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {statistics?.recentAnalyses && statistics.recentAnalyses.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {statistics.recentAnalyses.map((analysis) => (
              <div key={analysis._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">{analysis.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Link
                  to={`/analysis/${analysis._id}`}
                  className="btn btn-secondary text-sm"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const SecurityTab = ({ user, onChangePassword, onDeleteAccount }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [errors, setErrors] = useState({})
  const [changingPassword, setChangingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validatePasswordForm = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (!validatePassword(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must be at least 6 characters with uppercase, lowercase, and number'
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    setChangingPassword(true)

    try {
      const result = await onChangePassword(passwordData.currentPassword, passwordData.newPassword)

      if (result.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        toast.success('Password changed successfully!')
      }
    } catch (error) {
      console.error('Password change error:', error)
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your analyses, chats, and data.'
    )

    if (!confirmed) return

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )

    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    setDeletingAccount(true)

    try {
      const result = await onDeleteAccount()
      if (result.success) {
        toast.success('Account deleted successfully')
      }
    } catch (error) {
      console.error('Account deletion error:', error)
    } finally {
      setDeletingAccount(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  return (
    <div className="space-y-8">
      {/* Account Information */}
      <div>
        <h3 className="font-semibold mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{user?.email}</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Member Since</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      {!user?.googleId && (
        <div>
          <h3 className="font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`input pr-10 ${errors.currentPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FormFieldError error={errors.currentPassword} />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`input pr-10 ${errors.newPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FormFieldError error={errors.newPassword} />

              {passwordData.newPassword && (
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
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`input pr-10 ${errors.confirmPassword ? 'border-red-300 dark:border-red-600' : ''}`}
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FormFieldError error={errors.confirmPassword} />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="btn btn-primary flex items-center gap-2"
            >
              {changingPassword && <LoadingSpinner size="sm" color="white" />}
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Google Account Notice */}
      {user?.googleId && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
            Google Account
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            You're signed in with Google. To change your password, please visit your Google Account settings.
          </p>
        </div>
      )}

      {/* Danger Zone */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>

        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
            Delete Account
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="btn btn-danger flex items-center gap-2"
          >
            {deletingAccount ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deletingAccount ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

const VoiceTab = () => {
  return (
    <div>
      <h3 className="font-semibold mb-4">Voice & Accessibility Settings</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Configure text-to-speech settings for better accessibility and learning experience.
      </p>
      <VoiceControls />
    </div>
  )
}


export default Profile