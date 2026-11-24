import { ShieldCheck, MapPin, Star, CheckCircle2 } from 'lucide-react'
import { Avatar } from '@/components/commen'

interface Professional {
  id: string
  name: string
  service: string
  location: string
  rating?: number
  verified?: boolean
  image: string | null
}

// This would typically fetch from the database
// For now, showing empty state if no professionals exist
export default function VerifiedProfessionals() {
  const professionals: Professional[] = [
    // This would be populated from database
    // { id: '1', name: 'Professional Name', service: 'Electrician', location: 'Gilgit', rating: 4.8, verified: true, image: null }
  ]

  const hasProfessionals = professionals.length > 0

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8" suppressHydrationWarning>
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d98d2b]">Our professionals</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Verified by HunarLink</h2>
        <p className="mt-4 max-w-2xl mx-auto text-[#6d7e85]">
          Every professional on our platform is vetted, verified, and committed to quality service.
        </p>
      </div>

      {hasProfessionals ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((professional) => (
            <div
              key={professional.id}
              className="group rounded-3xl border border-[#e3ebe6] bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <Avatar name={professional.name} image={professional.image} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#153443]">{professional.name}</h3>
                    {professional.verified && (
                      <div className="flex size-5 items-center justify-center rounded-full bg-[#2f765b]">
                        <CheckCircle2 className="size-3 text-white" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#6d7e85]">{professional.service}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm text-[#6d7e85]">
                    <MapPin className="size-4" aria-hidden="true" />
                    <span>{professional.location}</span>
                  </div>
                  {professional.rating && (
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="size-4 fill-[#f5b841] text-[#f5b841]" aria-hidden="true" />
                      <span className="text-sm font-semibold text-[#153443]">{professional.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-[#e3ebe6] bg-[#f8faf9] p-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e3ebe6]">
            <ShieldCheck className="size-8 text-[#6d7e85]" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-[#153443]">No verified professionals yet</h3>
          <p className="mt-2 text-sm text-[#6d7e85]">
            Verified professionals will appear here as they join the HunarLink network.
          </p>
        </div>
      )}
    </section>
  )
}
