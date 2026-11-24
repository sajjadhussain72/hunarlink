'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f8f6] px-5 py-12" suppressHydrationWarning>
      <div className="text-center">
        <h1 className="text-4xl font-black text-[#153443]">Something went wrong</h1>
        <p className="mt-4 text-[#60757b]">An error occurred in the admin panel.</p>
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-xl bg-[#153443] px-5 py-3 font-bold text-white"
          >
            Try again
          </button>
          <Link href="/admin-login" className="rounded-xl border border-[#d5e2dc] px-5 py-3 font-bold text-[#153443]">
            Go to Admin Login
          </Link>
        </div>
      </div>
    </div>
  )
}
