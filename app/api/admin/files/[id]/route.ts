import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import FileEntry from '@/models/FileEntry'

// PUT /api/admin/files/[id] — update file (access, emails, password, name)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { fileName, access, allowedEmails, deletePassword } = body

  await connectDB()

  const update: Record<string, unknown> = {}
  if (fileName !== undefined) update.fileName = fileName
  if (access !== undefined) update.access = access
  if (allowedEmails !== undefined)
    update.allowedEmails = allowedEmails.map((e: string) => e.toLowerCase())
  if (deletePassword !== undefined) update.deletePassword = deletePassword

  const file = await FileEntry.findByIdAndUpdate(params.id, update, { new: true })
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ file })
}

// DELETE /api/admin/files/[id] — admin removes file (no password needed)
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  await FileEntry.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
