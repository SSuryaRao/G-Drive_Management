'use client'
import { useState } from 'react'

interface FileEntry {
  _id: string
  fileName: string
  access: 'public' | 'private'
  allowedEmails: string[]
}

interface Props {
  file: FileEntry
  onClose: () => void
  onSave: (fileId: string, data: { fileName: string; access: 'public' | 'private'; allowedEmails: string[] }) => Promise<void>
}

export default function EditFileModal({ file, onClose, onSave }: Props) {
  const [fileName, setFileName] = useState(file.fileName)
  const [access, setAccess] = useState<'public' | 'private'>(file.access)
  const [emailInput, setEmailInput] = useState('')
  const [allowedEmails, setAllowedEmails] = useState<string[]>([...file.allowedEmails])
  const [saving, setSaving] = useState(false)

  function addEmail() {
    const email = emailInput.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || allowedEmails.includes(email)) return
    setAllowedEmails((prev) => [...prev, email])
    setEmailInput('')
  }

  function handleEmailKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fileName.trim()) return
    if (access === 'private' && allowedEmails.length === 0) return
    setSaving(true)
    await onSave(file._id, { fileName: fileName.trim(), access, allowedEmails })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit File</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Type</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${access === 'public' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="access" value="public" checked={access === 'public'} onChange={() => setAccess('public')} className="text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-800">🌐 Public</div>
                  <div className="text-xs text-gray-500">Any logged-in user</div>
                </div>
              </label>
              <label className={`flex-1 flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${access === 'private' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="access" value="private" checked={access === 'private'} onChange={() => setAccess('private')} className="text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-800">🔒 Private</div>
                  <div className="text-xs text-gray-500">Specific users only</div>
                </div>
              </label>
            </div>
          </div>

          {access === 'private' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Allowed Emails</label>
              <div className="border border-gray-200 rounded-xl p-2 min-h-[50px] focus-within:ring-2 focus-within:ring-blue-500">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {allowedEmails.map((email) => (
                    <span key={email} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {email}
                      <button type="button" onClick={() => setAllowedEmails((prev) => prev.filter((e) => e !== email))} className="text-blue-400 hover:text-blue-700 ml-0.5">×</button>
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
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || (access === 'private' && allowedEmails.length === 0)} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
