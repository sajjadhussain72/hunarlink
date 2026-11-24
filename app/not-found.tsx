import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfcfa] px-5 py-12" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <h1 className="text-4xl font-black text-[#153443]">Page not found</h1>
        <p className="mt-4 text-[#60757b]">The page you're looking for doesn't exist.</p>
        <Link href="/" className="mt-8 inline-block rounded-xl bg-[#153443] px-5 py-3 font-bold text-white">
          Return to Home
        </Link>
      </div>
    </div>
  )
}
