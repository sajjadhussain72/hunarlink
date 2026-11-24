import Link from 'next/link'
import { Image as ImageIcon, MapPin, Calendar, ArrowRight } from 'lucide-react'

interface Project {
  id: string
  slug: string
  title: string
  service: string
  location: string
  completedAt: string
}

// This would typically fetch from the database
export default function CompletedProjects() {
  const projects: Project[] = [
    // This would be populated from database
    // { id: '1', title: 'Project Name', service: 'Electrical', location: 'Gilgit', image: '/project-image.jpg', completedAt: '2024-01-15' }
  ]

  const hasProjects = projects.length > 0

  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8" suppressHydrationWarning>
      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d98d2b]">Real work</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">See the Work HunarLink Manages</h2>
        <p className="mt-4 max-w-2xl mx-auto text-[#6d7e85]">
          Browse completed projects from real customers and verified professionals.
        </p>
      </div>

      {hasProjects ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/our-work/${project.slug}`}
              className="group rounded-3xl border border-[#e3ebe6] bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <ImageIcon className="absolute inset-0 m-auto size-12 text-gray-300" aria-hidden="true" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2f765b]">
                  <span>{project.service}</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden="true" />
                    <span>{project.location}</span>
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-bold text-[#153443]">{project.title}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-[#6d7e85]">
                    <Calendar className="size-3" aria-hidden="true" />
                    <span>{new Date(project.completedAt).toLocaleDateString()}</span>
                  </div>
                  <ArrowRight className="size-4 text-[#2f765b] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-[#e3ebe6] bg-[#f8faf9] p-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#e3ebe6]">
            <ImageIcon className="size-8 text-[#6d7e85]" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-[#153443]">No completed projects yet</h3>
          <p className="mt-2 text-sm text-[#6d7e85]">
            Completed projects will appear here as HunarLink manages real customer services.
          </p>
        </div>
      )}

      {hasProjects && (
        <div className="mt-12 text-center">
          <Link
            href="/our-work"
            className="inline-flex items-center gap-2 rounded-xl border border-[#153443] px-6 py-3.5 text-sm font-bold text-[#153443] transition hover:bg-[#153443] hover:text-white"
          >
            View all projects
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  )
}
