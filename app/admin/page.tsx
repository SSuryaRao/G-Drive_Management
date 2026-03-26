import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminClient from '@/components/AdminClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) redirect('/')
  if (!isAdmin(session.user.email)) redirect('/dashboard')

  return (
    <AdminClient
      adminName={session.user.name || ''}
      adminImage={session.user.image || ''}
    />
  )
}
