import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { AdminSupportChat } from '@/components/admin-support-chat'
import { AdminShell } from '@/components/admin-shell'

export default function AdminConversationsPage() {
  return <AdminShell><div className="mx-auto max-w-6xl"><Link href="/admin/service-requests" className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"><ArrowLeft data-icon="inline-start" /> Operations center</Link><div className="mt-8 flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-xl bg-[#f5b841]"><MessageCircle /></div><div><p className="text-sm font-bold uppercase tracking-[.18em] text-[#c47b13]">HunarLink inbox</p><h1 className="text-4xl font-bold tracking-[-.04em]">Client chat</h1></div></div><p className="mt-4 max-w-2xl leading-7 text-[#60757b]">Customers contact HunarLink here. Staff and admins reply as the company; personal professional contact details are never exposed.</p><AdminSupportChat /></div></AdminShell>
}
