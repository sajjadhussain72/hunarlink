import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function SignUpPage() { return <main className="flex min-h-screen items-center justify-center bg-[#fbfcfa] px-5 py-12"><section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"><p className="text-sm font-bold text-[#d98d2b]">HunarLink</p><h1 className="mt-2 text-3xl font-bold text-[#153443]">Create your account</h1><p className="mt-2 text-sm text-slate-500">Join your local services marketplace.</p><div className="mt-8"><AuthForm mode="sign-up" /></div><p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link className="font-bold text-[#153443]" href="/sign-in">Sign in</Link></p></section></main> }
