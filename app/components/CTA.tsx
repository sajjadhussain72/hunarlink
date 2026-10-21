import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="rounded-3xl bg-[#f5c35f] p-8 md:flex md:items-center md:justify-between md:p-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#70551c]">For skilled professionals</p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-.05em]">Join the HunarLink service network.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#70551c]">
            Work with a trusted local company, receive managed assignments and grow your professional reputation.
          </p>
        </div>
        <Link href="/professional/register" className="mt-7 inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#153443] px-5 py-3.5 text-sm font-bold text-white md:mt-0">
          Become a professional <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
