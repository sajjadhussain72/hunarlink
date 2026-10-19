'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const result = await authClient.signIn.email({ email: email.trim().toLowerCase(), password })
    setPending(false)
    if (result.error) {
      console.error('[v0] Admin sign-in failed:', result.error)
      setError('Invalid email or password. Check that you are using the current Admin password, not the ADMIN_PASSWORD environment value unless the account was newly bootstrapped.')
      return
    }
    router.replace('/admin')
    router.refresh()
  }

  return <form onSubmit={submit} className="space-y-5"><div><label htmlFor="admin-email" className="text-sm font-bold text-[#153443]">Email</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d5e2dc] px-4 py-3 outline-none focus:border-[#2f765b]" /></div><div><label htmlFor="admin-password" className="text-sm font-bold text-[#153443]">Password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d5e2dc] px-4 py-3 outline-none focus:border-[#2f765b]" /></div>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<a href="/admin/forgot-password" className="block text-right text-sm font-bold text-[#2f765b]">Forgot password?</a><button disabled={pending} className="w-full rounded-xl bg-[#153443] px-4 py-3 font-black text-white disabled:opacity-50">{pending ? 'Signing in…' : 'Sign in to Admin CRM'}</button></form>
}
