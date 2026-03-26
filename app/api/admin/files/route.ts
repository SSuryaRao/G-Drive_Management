import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import FileEntry from '@/models/FileEntry'
import { parseDriveUrl } from '@/lib/driveUtils'

// GET /api/admin/files — returns all files (admin only)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await connectDB()
  const files = await FileEntry.find().sort({ createdAt: -1 })
  return NextResponse.json({ files })
}

// POST /api/admin/files — add a new file entry
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { driveUrl, fileName, access, allowedEmails } = body

  if (!driveUrl || !fileName) {
    return NextResponse.json({ error: 'driveUrl and fileName are required' }, { status: 400 })
  }

  const parsed = parseDriveUrl(driveUrl)
  if (!parsed) {
    return NextResponse.json({ error: 'Invalid Google Drive URL' }, { status: 400 })
  }

  await connectDB()

  const file = await FileEntry.create({
    driveUrl,
    fileId: parsed.id,
    fileName,
    fileType: parsed.type,
    access: access || 'public',
    allowedEmails: (allowedEmails || []).map((e: string) => e.toLowerCase()),
    deletePassword: null,
  })

  return NextResponse.json({ file }, { status: 201 })
}
