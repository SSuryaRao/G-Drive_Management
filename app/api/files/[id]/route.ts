import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import FileEntry from '@/models/FileEntry'

// DELETE /api/files/[id] — user deletes a file using a password
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { password } = await request.json()
  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  await connectDB()

  const userEmail = session.user.email.toLowerCase()
  const file = await FileEntry.findById(params.id)

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // Check the user has access to this file
  const hasAccess =
    file.access === 'public' ||
    file.allowedEmails.includes(userEmail)

  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Check delete password
  if (!file.deletePassword) {
    return NextResponse.json({ error: 'No delete password set for this file' }, { status: 400 })
  }

  if (file.deletePassword !== password) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  await FileEntry.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
