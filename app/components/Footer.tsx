import Link from 'next/link'
import { Phone, Mail, MapPin, Wrench } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#102934] px-5 py-16 text-white" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl" suppressHydrationWarning>
        <div className="grid gap-12 md:grid-cols-4" suppressHydrationWarning>
          {/* Brand */}
          <div className="md:col-span-1" suppressHydrationWarning>
            <Link href="/" className="flex items-center gap-2.5" aria-label="HunarLink home">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f765b] to-[#1a5c45] text-white">
                <Wrench aria-hidden="true" className="size-5" />
              </span>
              <span className="text-xl font-bold">
                Hunar<span className="text-[#f5b841]">Link</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Professional services, managed by HunarLink. Connecting you with verified local professionals in Gilgit-Baltistan.
            </p>
          </div>

          {/* Quick Links */}
          <div suppressHydrationWarning>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f5b841]">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="#services" className="text-sm text-white/80 transition hover:text-white">Our Services</Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-sm text-white/80 transition hover:text-white">How It Works</Link>
              </li>
              <li>
                <Link href="/our-work" className="text-sm text-white/80 transition hover:text-white">Our Work</Link>
              </li>
              <li>
                <Link href="/professional/register" className="text-sm text-white/80 transition hover:text-white">Become a Professional</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div suppressHydrationWarning>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f5b841]">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Phone className="size-4" aria-hidden="true" />
                <a href="tel:+923119947493" className="transition hover:text-white">+92 311 994 7493</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/80">
                <Mail className="size-4" aria-hidden="true" />
                <a href="mailto:info@hunarlink.com" className="transition hover:text-white">info@hunarlink.com</a>
              </li>
              <li className="flex items-start gap-2 text-sm text-white/80">
                <MapPin className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>Gilgit-Baltistan, Pakistan</span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div suppressHydrationWarning>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f5b841]">Support</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/support" className="text-sm text-white/80 transition hover:text-white">Contact Support</Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-white/80 transition hover:text-white">FAQ</Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-white/80 transition hover:text-white">Terms of Service</Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-white/80 transition hover:text-white">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8" suppressHydrationWarning>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" suppressHydrationWarning>
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} HunarLink. All rights reserved.
            </p>
            <p className="text-xs text-white/60">
              Professional Services, Managed by HunarLink · Gilgit-Baltistan
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
