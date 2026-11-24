import { MapPin } from 'lucide-react'

export default function Locations() {
  const locations = [
    { name: 'Gilgit City', areas: ['Danyor', 'Nomal', 'Konodas', 'Sekwar'] },
    { name: 'Hunza', areas: ['Karimabad', 'Aliabad', 'Altit', 'Ganish'] },
  ]

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8" suppressHydrationWarning>
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d98d2b]">Service areas</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Serving Gilgit-Baltistan</h2>
        <p className="mt-4 max-w-2xl mx-auto text-[#6d7e85]">
          Professional services available across major locations in the region.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {locations.map((location) => (
          <div
            key={location.name}
            className="rounded-3xl border border-[#e3ebe6] bg-white p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#2f765b] text-white">
                <MapPin className="size-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-[#153443]">{location.name}</h3>
            </div>
            <ul className="mt-6 space-y-3">
              {location.areas.map((area) => (
                <li key={area} className="flex items-center gap-2 text-sm text-[#6d7e85]">
                  <div className="size-1.5 rounded-full bg-[#2f765b]" />
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-[#6d7e85]">
          Don't see your area? <a href="/support" className="font-semibold text-[#2f765b] hover:underline">Contact us</a> to check availability.
        </p>
      </div>
    </section>
  )
}
