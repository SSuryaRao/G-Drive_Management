import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import FileEntry from '@/models/FileEntry'

// GET /api/files — returns files accessible to the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const userEmail = session.user.email.toLowerCase()

  const files = await FileEntry.find({
    $or: [
      { access: 'public' },
      { access: 'private', allowedEmails: userEmail },
    ],
  }).sort({ createdAt: -1 })

  return NextResponse.json({ files })
}
