import Link from 'next/link'
import { ArrowRight, ShieldCheck, Wrench, Zap } from 'lucide-react'

const services = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Mason', 'Mechanic', 'AC Technician', 'Solar Technician', 'Cleaner', 'Home Maintenance', 'Construction Worker', 'Other Local Services']

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#d98d2b]">HunarLink services</p>
      <h2 className="mt-3 text-4xl font-bold tracking-[-.05em] md:text-5xl">Help for the work that matters.</h2>
      <p className="mt-3 max-w-xl text-[#6d7e85]">
        Book a service through HunarLink. Our team coordinates a verified professional for your location and schedule.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {services.map((service, index) => (
          <Link
            key={service}
            href={`/book-service?service=${service.toLowerCase().replaceAll(' ', '-')}`}
            className="group rounded-2xl border border-[#e3ebe6] bg-white p-4 transition hover:-translate-y-1 hover:border-[#c2d9cb] hover:shadow-lg"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf5ef] text-[#2d8067]" aria-hidden="true">
              {index % 3 === 0 ? <Zap /> : index % 3 === 1 ? <Wrench /> : <ShieldCheck />}
            </span>
            <span className="mt-5 block text-sm font-bold">{service}</span>
            <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#789087]">
              Book service <ArrowRight aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
