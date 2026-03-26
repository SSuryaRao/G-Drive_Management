'use client'
import { useState, useEffect, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import DeleteModal from './DeleteModal'

interface FileEntry {
  _id: string
  driveUrl: string
  fileName: string
  fileType: 'file' | 'folder'
  access: 'public' | 'private'
  deletePassword: string | null
}

interface Props {
  userEmail: string
  userName: string
  userImage: string
}

export default function DashboardClient({ userName, userImage }: Props) {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingFile, setDeletingFile] = useState<FileEntry | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/files')
    const data = await res.json()
    setFiles(data.files || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  async function handleDelete(password: string): Promise<{ error?: string }> {
    if (!deletingFile) return {}
    const res = await fetch(`/api/files/${deletingFile._id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f._id !== deletingFile._id))
      setDeletingFile(null)
      showToast('File removed from portal.')
      return {}
    }
    return { error: data.error || 'Something went wrong' }
  }

  const firstName = userName.split(' ')[0]

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
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h1 className="text-base font-bold text-gray-900">Drive Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            {userImage && (
              <Image src={userImage} alt={userName} width={32} height={32} className="rounded-full" />
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{userName}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Welcome back, {firstName}!</h2>
          <p className="text-sm text-gray-500 mt-0.5">Here are the files you have access to.</p>
        </div>

        {/* Files */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No files available</p>
            <p className="text-gray-400 text-sm mt-1">You don&apos;t have access to any files yet.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <div
                key={file._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-gray-300 transition-all"
              >
                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${file.fileType === 'folder' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                    {file.fileType === 'folder' ? (
                      <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${file.access === 'public' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {file.access === 'public' ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>

                {/* Name */}
                <h3 className="font-semibold text-gray-900 mb-4 leading-tight">{file.fileName}</h3>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={file.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in Drive
                  </a>
                  {file.deletePassword && (
                    <button
                      onClick={() => setDeletingFile(file)}
                      className="flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all"
                      title="Delete from portal"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {deletingFile && (
        <DeleteModal
          fileName={deletingFile.fileName}
          onClose={() => setDeletingFile(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
