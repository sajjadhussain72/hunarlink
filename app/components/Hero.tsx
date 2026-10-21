import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#153443]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(245,184,65,.22),transparent_35%)]" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-[#f9d27a]">
            <Sparkles aria-hidden="true" /> Professional services, managed by HunarLink
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-[-.065em] sm:text-6xl md:text-[76px]">
            Reliable services. <span className="text-[#f5c35f]">One trusted company.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
            Tell us what you need. HunarLink finds the right professional and manages your service from request to completion.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/our-work" className="inline-flex items-center gap-2 rounded-xl bg-[#f5b841] px-5 py-3.5 text-sm font-bold text-[#153443]">
              Book a service <ArrowRight aria-hidden="true" />
            </Link>
            <a href="#services" className="rounded-xl border border-white/20 px-5 py-3.5 text-sm font-bold text-white">
              Explore services
            </a>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
          <p className="text-sm font-bold text-[#f9d27a]">Your service, managed</p>
          <h2 className="mt-3 text-2xl font-bold text-white">From request to done, we stay responsible.</h2>
          <div className="mt-7 flex flex-col gap-4">
            {[
              ['Request received', 'Tell us what you need'],
              ['Professional assigned', 'We choose the right verified expert'],
              ['Service completed', 'Confirm the work and share feedback'],
            ].map(([title, copy], index) => (
              <div key={title} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5b841] text-sm font-black text-[#153443]" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/60">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
