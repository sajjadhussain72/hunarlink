import { MapPin, ShieldCheck, Clock3, ArrowRight } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: MapPin,
      title: 'Submit your request',
      copy: 'Share the issue, location, and preferred schedule in a few easy steps.',
      number: '01',
    },
    {
      icon: ShieldCheck,
      title: 'We assign the right professional',
      copy: 'Our operations team reviews your request and coordinates a verified professional.',
      number: '02',
    },
    {
      icon: Clock3,
      title: 'Track until complete',
      copy: 'Receive updates from HunarLink, confirm completion, and leave feedback.',
      number: '03',
    },
  ]

  return (
    <section id="how-it-works" className="border-y border-[#e7eeea] bg-gradient-to-b from-[#f8faf9] to-white" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d98d2b]">Simple by design</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">You tell us. We handle the rest.</h2>
          <p className="mt-4 max-w-2xl mx-auto text-[#6d7e85]">
            From request to completion, HunarLink manages every step of your service experience.
          </p>
        </div>
        
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, copy, number }, index) => (
            <div key={title} className="group relative">
              {/* Step number */}
              <div className="absolute -left-4 -top-4 text-8xl font-black text-[#e3ebe6]/50 group-hover:text-[#2f765b]/10 transition-colors">
                {number}
              </div>
              
              <div className="relative rounded-3xl border border-[#e2ebe5] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f765b] to-[#1a5c45] text-white shadow-lg">
                  <Icon className="size-8" aria-hidden="true" />
                </div>
                
                <h3 className="mt-6 text-xl font-bold text-[#153443]">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#718289]">{copy}</p>
                
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden md:block -translate-y-1/2 translate-x-1/2">
                    <ArrowRight className="size-6 text-[#e3ebe6]" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href="#services"
            className="inline-flex items-center gap-2 rounded-xl bg-[#153443] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1a4152]"
          >
            Get started today
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
