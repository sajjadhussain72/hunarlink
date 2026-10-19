'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ShieldCheck, Wrench } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function ProfessionalRegisterPage() {
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(formData: FormData) {
    setPending(true); setError(''); setMessage('')
    const result = await authClient.signUp.email({ name: String(formData.get('name')), email: String(formData.get('email')), password: String(formData.get('password')) })
    setPending(false)
    if (result.error) { setError('We could not create your account. Please check your details and try again.'); return }
    setMessage('Your account is created. HunarLink will collect your professional details and review your profile before assigning services.')
  }
  return <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 text-[#153443]"><div className="mx-auto max-w-2xl"><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"><ArrowLeft data-icon="inline-start" /> Back to HunarLink</Link><div className="mt-8 rounded-3xl border border-[#e3ece7] bg-white p-8 shadow-sm md:p-12"><div className="flex size-12 items-center justify-center rounded-xl bg-[#f5b841]"><Wrench /></div><p className="mt-7 text-sm font-bold uppercase tracking-[.18em] text-[#c47b13]">Join the network</p><h1 className="mt-3 text-4xl font-bold tracking-[-.04em]">Become a HunarLink professional</h1><p className="mt-4 leading-7 text-[#60757b]">Create your account to start your verification process. Approved professionals receive managed service assignments from HunarLink.</p><form action={submit} className="mt-8 flex flex-col gap-4"><input name="name" required placeholder="Full name" className="rounded-xl border border-[#d9e5df] px-4 py-3 outline-none focus:border-[#c47b13]" /><input name="email" required type="email" placeholder="Email address" className="rounded-xl border border-[#d9e5df] px-4 py-3 outline-none focus:border-[#c47b13]" /><input name="password" required minLength={8} type="password" placeholder="Password (8+ characters)" className="rounded-xl border border-[#d9e5df] px-4 py-3 outline-none focus:border-[#c47b13]" /><button disabled={pending} className="rounded-xl bg-[#153443] px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? 'Creating account…' : 'Create professional account'}</button></form>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}{message && <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700"><CheckCircle2 className="mr-2 inline" />{message}</p>}<div className="mt-8 flex gap-3 rounded-2xl bg-[#f6faf7] p-4 text-sm text-[#60757b]"><ShieldCheck className="shrink-0 text-[#c47b13]" /> HunarLink verifies professional profiles before assignments are sent.</div></div></div></main>
}
