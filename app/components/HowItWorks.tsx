import { Clock3, MapPin, ShieldCheck } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: MapPin,
      title: 'Choose your service',
      copy: 'Share the issue, location and preferred schedule in a few easy steps.',
    },
    {
      icon: ShieldCheck,
      title: 'We assign the right professional',
      copy: 'Our operations team reviews your request and coordinates a verified professional.',
    },
    {
      icon: Clock3,
      title: 'Track until complete',
      copy: 'Receive updates from HunarLink, confirm completion and leave feedback.',
    },
  ]

  return (
    <section id="how-it-works" className="border-y border-[#e7eeea] bg-[#f3f7f4]">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d98d2b]">Simple by design</p>
        <h2 className="mt-3 text-4xl font-bold tracking-[-.05em]">You tell us. We handle the rest.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="rounded-2xl border border-[#e2ebe5] bg-white p-7">
              <Icon className="text-[#2d8067]" aria-hidden="true" />
              <h3 className="mt-10 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#718289]">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
