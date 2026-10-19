import Link from 'next/link'
import { ArrowLeft, Heart, Headphones } from 'lucide-react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function FavoritesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?next=/dashboard/favorites')
  return <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 text-[#153443]"><div className="mx-auto max-w-3xl"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"><ArrowLeft data-icon="inline-start" /> Dashboard</Link><div className="mt-10 rounded-3xl border border-[#e3ece7] bg-white p-8 text-center md:p-14"><Heart className="mx-auto text-[#c47b13]" /><h1 className="mt-5 text-3xl font-bold">Your trusted service team</h1><p className="mx-auto mt-3 max-w-lg leading-7 text-[#60757b]">HunarLink assigns the right verified professional for each request, so you do not need to search, compare, or negotiate with individual workers.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/book-service" className="rounded-xl bg-[#153443] px-5 py-3 font-bold text-white">Book a service</Link><Link href="/support" className="inline-flex items-center gap-2 rounded-xl border border-[#d7e2dc] px-5 py-3 font-bold"><Headphones /> Contact HunarLink</Link></div></div></div></main>
}
