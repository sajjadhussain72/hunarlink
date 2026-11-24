import Link from 'next/link'
import { ArrowRight, Briefcase, CheckCircle2, TrendingUp } from 'lucide-react'

export default function CTA() {
  const benefits = [
    { icon: CheckCircle2, text: 'Verified professional network' },
    { icon: TrendingUp, text: 'Grow your customer base' },
    { icon: Briefcase, text: 'Managed service assignments' },
  ]

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8" suppressHydrationWarning>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f5c35f] via-[#f9d27a] to-[#f5b841] p-8 md:p-12 lg:p-16">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-white/10" />
        <div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-white/10" />
        
        <div className="relative grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#70551c]">For skilled professionals</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#153443] md:text-4xl">
              Join the HunarLink service network
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[#70551c]">
              Work with a trusted local company, receive managed assignments, and grow your professional reputation in Gilgit-Baltistan.
            </p>
            
            <div className="mt-8 space-y-3">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div key={benefit.text} className="flex items-center gap-3">
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#153443]/10">
                      <Icon className="size-4 text-[#153443]" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-[#153443]">{benefit.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <Link
              href="/professional/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#153443] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#1a4152] focus:ring-2 focus:ring-[#153443] focus:ring-offset-2"
            >
              Become a professional
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#153443] px-6 py-4 text-sm font-bold text-[#153443] transition hover:bg-[#153443] hover:text-white focus:ring-2 focus:ring-[#153443] focus:ring-offset-2"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
