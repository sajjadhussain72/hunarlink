import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { CustomerDashboard } from '@/components/customer-dashboard'
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?next=/dashboard')
  return <CustomerDashboard />
}
