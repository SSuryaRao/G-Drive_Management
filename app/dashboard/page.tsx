import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) redirect('/')

  return (
    <DashboardClient
      userEmail={session.user.email}
      userName={session.user.name || ''}
      userImage={session.user.image || ''}
    />
  )
}
