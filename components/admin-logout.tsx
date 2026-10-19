'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AdminLogout() {
  const router = useRouter()
  async function logout() {
    await authClient.signOut()
    router.replace('/admin-login')
    router.refresh()
  }
  return <button type="button" onClick={logout} className="rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold text-[#153443]">Logout</button>
}
