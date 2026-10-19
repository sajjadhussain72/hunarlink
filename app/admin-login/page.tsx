import Link from 'next/link'
import { AdminLoginForm } from '@/components/admin-login-form'

export const metadata = { title: 'Admin Login | HunarLink', robots: { index: false, follow: false } }

export default function AdminLoginPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#f5f8f6] px-5 py-12"><section className="w-full max-w-md rounded-3xl border border-[#dbe7e0] bg-white p-8 shadow-sm"><Link href="/" className="text-sm font-black text-[#c47b13]">HunarLink</Link><h1 className="mt-5 text-3xl font-black text-[#153443]">Admin Login</h1><p className="mt-2 text-sm leading-6 text-[#60757b]">Sign in with an authorized Admin account to access the private operations CRM.</p><div className="mt-8"><AdminLoginForm /></div><Link href="/" className="mt-6 block text-center text-sm font-bold text-[#60757b]">Return to website</Link></section></main>
}
