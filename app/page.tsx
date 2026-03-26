import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user?.email) {
    if (isAdmin(session.user.email)) {
      redirect('/admin')
    }
    redirect('/dashboard')
  }

  return <LandingPage />
}
