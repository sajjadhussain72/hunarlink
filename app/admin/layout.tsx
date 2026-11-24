import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AdminShell } from '@/components/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/admin-login')
  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) redirect('/admin-login?error=denied')

  return <AdminShell>{children}</AdminShell>
}
