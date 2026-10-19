'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (event.nativeEvent instanceof SubmitEvent && (event.nativeEvent as SubmitEvent).submitter === null) return
    setPending(true); setError('')
    const data = new FormData(event.currentTarget)
    const result = mode === 'sign-up'
      ? await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) })
      : await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) })
    if (result.error) setError('We could not complete that request. Check your details and try again.')
    else { router.push('/dashboard'); router.refresh() }
    setPending(false)
  }
  return <form onSubmit={submit} className="flex flex-col gap-4">
    {mode === 'sign-up' && <label className="flex flex-col gap-2 text-sm font-semibold">Full name<input name="name" required minLength={2} className="rounded-lg border px-3 py-2.5 font-normal" /></label>}
    <label className="flex flex-col gap-2 text-sm font-semibold">Email<input name="email" required type="email" className="rounded-lg border px-3 py-2.5 font-normal" /></label>
    <label className="flex flex-col gap-2 text-sm font-semibold">Password<input name="password" required type="password" minLength={8} className="rounded-lg border px-3 py-2.5 font-normal" /></label>
    {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <button disabled={pending} className="rounded-lg bg-[#153443] px-4 py-3 font-bold text-white disabled:opacity-60">{pending ? 'Please wait…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
  </form>
}
