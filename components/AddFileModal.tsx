'use client'
import { useState } from 'react'
import { parseDriveUrl } from '@/lib/driveUtils'

interface Props {
  onClose: () => void
  onSave: (data: {
    driveUrl: string
    fileName: string
    access: 'public' | 'private'
    allowedEmails: string[]
  }) => Promise<void>
}

export default function AddFileModal({ onClose, onSave }: Props) {
  const [driveUrl, setDriveUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [access, setAccess] = useState<'public' | 'private'>('public')
  const [emailInput, setEmailInput] = useState('')
  const [allowedEmails, setAllowedEmails] = useState<string[]>([])
  const [urlError, setUrlError] = useState('')
  const [saving, setSaving] = useState(false)
  const [detectedType, setDetectedType] = useState<'file' | 'folder' | null>(null)

  function handleUrlChange(val: string) {
    setDriveUrl(val)
    setUrlError('')
    const parsed = parseDriveUrl(val)
    if (val && parsed) {
      setDetectedType(parsed.type)
    } else {
      setDetectedType(null)
    }
  }

  function addEmail() {
    const email = emailInput.trim().toLowerCase()
    if (!email) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    if (allowedEmails.includes(email)) return
    setAllowedEmails((prev) => [...prev, email])
    setEmailInput('')
  }

  function handleEmailKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail()
    }
  }

  function removeEmail(email: string) {
    setAllowedEmails((prev) => prev.filter((e) => e !== email))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = parseDriveUrl(driveUrl)
    if (!parsed) {
      setUrlError('Invalid Google Drive URL. Please paste a valid Drive link.')
      return
    }
    if (!fileName.trim()) return
    if (access === 'private' && allowedEmails.length === 0) return

    setSaving(true)
    await onSave({ driveUrl, fileName: fileName.trim(), access, allowedEmails })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New File / Folder</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Drive URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Google Drive URL
            </label>
            <input
              type="url"
              value={driveUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
            {detectedType && !urlError && (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Detected: {detectedType === 'folder' ? 'Folder' : 'File'}
              </p>
            )}
          </div>

          {/* File Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. Q1 Report, Team Docs"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Access Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${access === 'public' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="access"
                  value="public"
                  checked={access === 'public'}
                  onChange={() => setAccess('public')}
                  className="text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800">🌐 Public</div>
                  <div className="text-xs text-gray-500">Any logged-in user</div>
                </div>
              </label>
              <label className={`flex-1 flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${access === 'private' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="access"
                  value="private"
                  checked={access === 'private'}
                  onChange={() => setAccess('private')}
                  className="text-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800">🔒 Private</div>
                  <div className="text-xs text-gray-500">Specific users only</div>
                </div>
              </label>
            </div>
          </div>

          {/* Allowed Emails — only if private */}
          {access === 'private' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Allowed Emails
              </label>
              <div className="border border-gray-200 rounded-xl p-2 min-h-[50px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {allowedEmails.map((email) => (
                    <span
                      key={email}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="text-blue-400 hover:text-blue-700 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  onBlur={addEmail}
                  placeholder="Type email and press Enter..."
                  className="w-full px-2 py-1 text-sm outline-none bg-transparent"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Press Enter or comma to add each email</p>
              {access === 'private' && allowedEmails.length === 0 && (
                <p className="text-amber-500 text-xs mt-1">Add at least one email for private access</p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (access === 'private' && allowedEmails.length === 0)}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Add File'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
