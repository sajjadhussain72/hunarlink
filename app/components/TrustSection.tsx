import { ShieldCheck, Users, MapPin, Star } from 'lucide-react'

export default function TrustSection() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Verified Professionals',
      description: 'Every professional is vetted and verified before joining our platform.',
    },
    {
      icon: Users,
      title: 'Managed Service',
      description: 'HunarLink coordinates and manages your service from start to finish.',
    },
    {
      icon: MapPin,
      title: 'Local Experts',
      description: 'Professionals from your community who understand local needs.',
    },
    {
      icon: Star,
      title: 'Customer Feedback',
      description: 'Real reviews and ratings from verified customers.',
    },
  ]

  return (
    <section className="bg-[#153443] py-24" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f9d27a]">Why choose HunarLink</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">Trust in every service</h2>
          <p className="mt-4 max-w-2xl mx-auto text-white/80">
            We're committed to providing reliable, professional services you can count on.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/10 text-[#f9d27a]">
                  <Icon className="size-8" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
