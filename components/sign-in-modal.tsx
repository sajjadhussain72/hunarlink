'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export function SignInModal({ isOpen, onClose, redirectTo }: { isOpen: boolean; onClose: () => void; redirectTo?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (event.nativeEvent instanceof SubmitEvent && (event.nativeEvent as SubmitEvent).submitter === null) return
    setPending(true)
    setError('')
    const data = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({ 
      email: String(data.get('email')), 
      password: String(data.get('password')) 
    })
    if (result.error) {
      setError('We could not complete that request. Check your details and try again.')
      setPending(false)
    } else {
      onClose()
      if (redirectTo) {
        router.push(redirectTo)
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#d98d2b]">HunarLink</p>
            <h1 className="mt-2 text-2xl font-bold text-[#153443]">Sign in to continue</h1>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#60757b] hover:bg-gray-100" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Email
            <input name="email" required type="email" className="rounded-lg border border-[#dfeae3] px-3 py-2.5 font-normal focus:border-[#d98d2b] focus:outline-none" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Password
            <input name="password" required type="password" minLength={8} className="rounded-lg border border-[#dfeae3] px-3 py-2.5 font-normal focus:border-[#d98d2b] focus:outline-none" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button disabled={pending} className="rounded-lg bg-[#153443] px-4 py-3 font-bold text-white disabled:opacity-60">
            {pending ? 'Please wait…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New to HunarLink? <a href="/sign-up" className="font-bold text-[#153443] hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  )
}
