'use client'
import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import AddFileModal from './AddFileModal'
import EditFileModal from './EditFileModal'
import PasswordModal from './PasswordModal'

interface FileEntry {
  _id: string
  driveUrl: string
  fileId: string
  fileName: string
  fileType: 'file' | 'folder'
  access: 'public' | 'private'
  allowedEmails: string[]
  deletePassword: string | null
  createdAt: string
}

interface Props {
  adminName: string
  adminImage: string
}

export default function AdminClient({ adminName, adminImage }: Props) {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFile, setEditingFile] = useState<FileEntry | null>(null)
  const [passwordFile, setPasswordFile] = useState<FileEntry | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/files')
    const data = await res.json()
    setFiles(data.files || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  async function handleAddFile(formData: {
    driveUrl: string
    fileName: string
    access: 'public' | 'private'
    allowedEmails: string[]
  }) {
    const res = await fetch('/api/admin/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (res.ok) {
      await fetchFiles()
      setShowAddModal(false)
      showToast('File added successfully!')
    } else {
      const d = await res.json()
      showToast(d.error || 'Failed to add file', 'error')
    }
  }

  async function handleEditFile(
    fileId: string,
    data: { fileName: string; access: 'public' | 'private'; allowedEmails: string[] }
  ) {
    const res = await fetch(`/api/admin/files/${fileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      await fetchFiles()
      setEditingFile(null)
      showToast('File updated!')
    } else {
      showToast('Failed to update file', 'error')
    }
  }

  async function handleSetPassword(fileId: string, password: string) {
    const res = await fetch(`/api/admin/files/${fileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletePassword: password }),
    })
    if (res.ok) {
      await fetchFiles()
      setPasswordFile(null)
      showToast('Delete password saved!')
    } else {
      showToast('Failed to save password', 'error')
    }
  }

  async function handleRemove(fileId: string) {
    if (!confirm('Remove this file from the portal?')) return
    setRemovingId(fileId)
    await fetch(`/api/admin/files/${fileId}`, { method: 'DELETE' })
    await fetchFiles()
    setRemovingId(null)
    showToast('File removed.')
  }

  const publicCount = files.filter((f) => f.access === 'public').length
  const privateCount = files.filter((f) => f.access === 'private').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Drive Access Manager</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {adminImage && (
              <Image src={adminImage} alt={adminName} width={32} height={32} className="rounded-full" />
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{adminName}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats + Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-gray-900">{files.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Total</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-blue-600">{publicCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Public</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-purple-600">{privateCount}</div>
              <div className="text-xs text-gray-500 mt-0.5">Private</div>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add File / Folder
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No files added yet</p>
              <p className="text-gray-400 text-sm mt-1">Click &ldquo;Add File / Folder&rdquo; to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">File</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Access</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Delete Pass</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Drive URL</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, idx) => (
                    <tr key={file._id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx === files.length - 1 ? 'border-0' : ''}`}>
                      {/* File name + type */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${file.fileType === 'folder' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                            {file.fileType === 'folder' ? (
                              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{file.fileName}</div>
                            <div className="text-xs text-gray-400 capitalize">{file.fileType}</div>
                          </div>
                        </div>
                      </td>

                      {/* Access */}
                      <td className="px-5 py-4">
                        {file.access === 'public' ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            🌐 Public
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
                              🔒 Private
                            </span>
                            <div className="text-xs text-gray-400 mt-1">{file.allowedEmails.length} user{file.allowedEmails.length !== 1 ? 's' : ''}</div>
                          </div>
                        )}
                      </td>

                      {/* Delete Password */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setPasswordFile(file)}
                          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${file.deletePassword ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          {file.deletePassword ? 'Set ✓' : 'Set Pass'}
                        </button>
                      </td>

                      {/* Drive URL */}
                      <td className="px-5 py-4">
                        <a
                          href={file.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-xs underline underline-offset-2 max-w-[160px] truncate block"
                        >
                          Open in Drive ↗
                        </a>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingFile(file)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemove(file._id)}
                            disabled={removingId === file._id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddFileModal onClose={() => setShowAddModal(false)} onSave={handleAddFile} />
      )}
      {editingFile && (
        <EditFileModal file={editingFile} onClose={() => setEditingFile(null)} onSave={handleEditFile} />
      )}
      {passwordFile && (
        <PasswordModal file={passwordFile} onClose={() => setPasswordFile(null)} onSave={handleSetPassword} />
      )}
    </div>
  )
}
