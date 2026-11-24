'use client'

import Link from 'next/link'
import { Menu, Phone, Wrench, X, BriefcaseBusiness, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/commen'

export default function Header() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let isMounted = true
    // Don't block initial render - load auth asynchronously
    Promise.resolve().then(async () => {
      const { data } = await authClient.getSession()
      if (isMounted) {
        setUser(data?.user || null)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isProfessional = user?.role === 'PROFESSIONAL'
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  const isCustomer = user?.role === 'CUSTOMER'

  const handleLogout = async () => {
    await authClient.signOut()
    setUser(null)
    router.push('/')
  }

  const getRoleBadgeColor = () => {
    if (isAdmin) return 'bg-[#c47b13] text-white'
    if (isProfessional) return 'bg-[#2f765b] text-white'
    return 'bg-[#60757b] text-white'
  }

  const getRoleLabel = () => {
    if (isAdmin) return 'Admin'
    if (isProfessional) return 'Professional'
    if (isCustomer) return 'Customer'
    return user?.role || 'User'
  }

  return (
    <header suppressHydrationWarning className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'border-b border-[#e7eeea]/80 bg-white/95 backdrop-blur shadow-sm' 
        : 'border-b border-transparent bg-[#fbfcfa]/95 backdrop-blur'
    }`}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8" suppressHydrationWarning>
        <Link href="/" className="flex items-center gap-2.5" aria-label="HunarLink home">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f765b] to-[#1a5c45] text-white shadow-lg">
            <Wrench aria-hidden="true" className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">
            Hunar<span className="text-[#d98d2b]">Link</span>
          </span>
        </Link>
        
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#60757b] md:flex" aria-label="Main navigation">
          <a href="#services" className="transition hover:text-[#2f765b]">Our services</a>
          <a href="#how-it-works" className="transition hover:text-[#2f765b]">How it works</a>
          <Link href="/support" className="transition hover:text-[#2f765b]">Support</Link>
          <a href="tel:+923119947493" className="inline-flex items-center gap-1.5 font-semibold text-[#2f765b] transition hover:text-[#256b4f]" aria-label="Call HunarLink">
            <Phone className="size-4" aria-hidden="true" /> Call us
          </a>
        </nav>
        
        <div className="hidden items-center gap-3 md:flex" suppressHydrationWarning>
          {loading ? (
            <span className="text-sm text-[#60757b]">Loading...</span>
          ) : user ? (
            <>
              {isProfessional && (
                <Link href="/professional/dashboard" className="flex items-center gap-2 rounded-lg bg-[#2f765b] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#256b4f]">
                  <BriefcaseBusiness className="size-4" />
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-2 rounded-lg bg-[#c47b13] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#a8650f]">
                  Admin
                </Link>
              )}
              {isCustomer && (
                <Link href="/dashboard" className="px-3 py-2 text-sm font-bold transition hover:text-[#2f765b]">Dashboard</Link>
              )}
              <div className="flex items-center gap-3 rounded-full border border-[#e7eeea] bg-white px-3 py-1.5 shadow-sm" suppressHydrationWarning>
                <Avatar name={user.name || 'User'} image={user.image} size="sm" />
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getRoleBadgeColor()}`}>
                  {getRoleLabel()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-[#c84b4b] px-4 py-2.5 text-sm font-bold text-[#c84b4b] transition hover:bg-[#c84b4b] hover:text-white"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="px-3 py-2 text-sm font-bold transition hover:text-[#2f765b]">Sign in</Link>
              <Link href="/professional/register" className="rounded-lg bg-[#153443] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1a4152]">Become a professional</Link>
            </>
          )}
        </div>
        
        <button 
          className="rounded-lg p-2 transition hover:bg-gray-100 md:hidden" 
          onClick={() => setMenuOpen(!menuOpen)} 
          aria-label="Toggle navigation" 
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      
      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-[#e7eeea] bg-white px-5 py-5 text-sm font-bold md:hidden" aria-label="Mobile navigation" suppressHydrationWarning>
          <a href="#services" onClick={() => setMenuOpen(false)} className="transition hover:text-[#2f765b]">Our services</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="transition hover:text-[#2f765b]">How it works</a>
          <Link href="/support" onClick={() => setMenuOpen(false)} className="transition hover:text-[#2f765b]">Support</Link>
          <a href="tel:+923119947493" className="inline-flex w-fit items-center gap-2 text-[#2f765b]" aria-label="Call HunarLink">
            <Phone className="size-4" aria-hidden="true" /> Call us
          </a>
          
          {loading ? (
            <span className="text-[#60757b]">Loading...</span>
          ) : user ? (
            <>
              {isProfessional && (
                <Link href="/professional/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg bg-[#2f765b] px-4 py-2 text-white">
                  <BriefcaseBusiness className="size-4" />
                  Professional Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg bg-[#c47b13] px-4 py-2 text-white">
                  Admin Dashboard
                </Link>
              )}
              {isCustomer && (
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="transition hover:text-[#2f765b]">Dashboard</Link>
              )}
              <div className="flex items-center gap-3 rounded-full border border-[#e7eeea] bg-white px-3 py-1.5" suppressHydrationWarning>
                <Avatar name={user.name || 'User'} image={user.image} size="sm" />
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getRoleBadgeColor()}`}>
                  {getRoleLabel()}
                </span>
              </div>
              <button
                onClick={() => {
                  handleLogout()
                  setMenuOpen(false)
                }}
                className="flex items-center gap-2 rounded-lg border border-[#c84b4b] px-4 py-2.5 text-sm font-bold text-[#c84b4b]"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="transition hover:text-[#2f765b]">Sign in</Link>
              <Link href="/professional/register" onClick={() => setMenuOpen(false)} className="w-fit rounded-lg bg-[#153443] px-4 py-2 text-white transition hover:bg-[#1a4152]">Become a professional</Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}
