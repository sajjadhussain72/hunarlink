'use client'

import Link from 'next/link'
import { Menu, Phone, Wrench, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7eeea]/80 bg-[#fbfcfa]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="HunarLink home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f5b841]">
            <Wrench aria-hidden="true" />
          </span>
          <span className="text-[19px] font-bold tracking-[-.04em]">
            Hunar<span className="text-[#d98d2b]">Link</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#60757b] md:flex" aria-label="Main navigation">
          <a href="#services">Our services</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/support">Support</Link>
          <a href="tel:+923119947493" className="inline-flex items-center gap-1.5 text-[#2f765b]" aria-label="Call HunarLink">
            <Phone className="size-4" aria-hidden="true" /> Call us
          </a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/sign-in" className="px-3 py-2 text-sm font-bold">Sign in</Link>
          <Link href="/professional/register" className="rounded-lg bg-[#153443] px-4 py-2.5 text-sm font-bold text-white">Become a professional</Link>
          <Link href="/admin-login" className="text-xs font-bold text-[#60757b]">Admin Login</Link>
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {menuOpen && (
        <nav className="flex flex-col gap-4 border-t border-[#e7eeea] bg-white px-5 py-5 text-sm font-bold md:hidden" aria-label="Mobile navigation">
          <a href="#services" onClick={() => setMenuOpen(false)}>Our services</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <Link href="/support">Support</Link>
          <a href="tel:+923119947493" className="inline-flex w-fit items-center gap-2 text-[#2f765b]" aria-label="Call HunarLink">
            <Phone className="size-4" aria-hidden="true" /> Call HunarLink
          </a>
          <Link href="/professional/register" className="w-fit rounded-lg bg-[#153443] px-4 py-2 text-white">Become a professional</Link>
        </nav>
      )}
    </header>
  )
}
