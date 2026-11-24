import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { ArrowLeft, CalendarDays, CircleAlert, Clock3, MapPin, Wrench, CheckCircle2, BriefcaseBusiness } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { serviceCategory, user } from '@/lib/db/schema'
import { serviceRequest, serviceAssignment, professionalProfile } from '@/lib/db/managed-schema'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Avatar } from '@/components/commen'

interface Assignment {
  assignment: {
    scheduledDate: Date | null
    scheduledTime: string | null
    status: string
  }
  profession: string | null
  professionalName: string | null
  professionalImage: string | null
}

export default async function RequestsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?next=/dashboard/requests')

  const requests = await db
    .select({
      id: serviceRequest.id,
      title: serviceRequest.title,
      address: serviceRequest.address,
      status: serviceRequest.status,
      urgency: serviceRequest.urgency,
      preferredDate: serviceRequest.preferredDate,
      preferredTime: serviceRequest.preferredTime,
      category: serviceCategory.name,
      createdAt: serviceRequest.createdAt,
    })
    .from(serviceRequest)
    .leftJoin(serviceCategory, eq(serviceRequest.categoryId, serviceCategory.id))
    .where(eq(serviceRequest.customerId, session.user.id))
    .orderBy(desc(serviceRequest.createdAt))

  // Get assignments for each request
  const requestsWithAssignments = await Promise.all(
    requests.map(async (request) => {
      const [assignment] = await db
        .select({
          assignment: {
            scheduledDate: serviceAssignment.scheduledDate,
            scheduledTime: serviceAssignment.scheduledTime,
            status: serviceAssignment.status,
          },
          profession: professionalProfile.profession,
          professionalName: user.name,
          professionalImage: user.image,
        })
        .from(serviceAssignment)
        .innerJoin(professionalProfile, eq(professionalProfile.id, serviceAssignment.professionalId))
        .innerJoin(user, eq(user.id, professionalProfile.userId))
        .where(eq(serviceAssignment.serviceRequestId, request.id))
        .limit(1) as unknown as Assignment[]

      return {
        ...request,
        assignment: assignment || null,
      }
    })
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-[#eaf5f0] text-[#2f765b]'
      case 'UNDER_REVIEW':
        return 'bg-[#fff5df] text-[#9a6410]'
      case 'ASSIGNED':
        return 'bg-[#e8f4fd] text-[#2563eb]'
      case 'CONFIRMED':
        return 'bg-[#eaf5f0] text-[#2f765b]'
      case 'SERVICE_STARTED':
        return 'bg-[#fff5df] text-[#9a6410]'
      case 'SERVICE_COMPLETED':
        return 'bg-[#eaf5f0] text-[#2f765b]'
      case 'CUSTOMER_CONFIRMED':
        return 'bg-[#eaf5f0] text-[#2f765b]'
      case 'CLOSED':
        return 'bg-[#f5f5f5] text-[#60757b]'
      case 'CANCELLED':
        return 'bg-[#fee2e2] text-[#dc2626]'
      default:
        return 'bg-[#f5f5f5] text-[#60757b]'
    }
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A'
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return 'N/A'
      return d.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  const formatStatus = (status: string | null | undefined) => {
    if (!status) return 'Unknown'
    return status.replaceAll('_', ' ')
  }

  return (
    <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 text-[#153443]" suppressHydrationWarning>
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]">
          <ArrowLeft data-icon="inline-start" /> Dashboard
        </Link>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[.16em] text-[#d98d2b]">Managed services</p>
          <h1 className="mt-2 text-4xl font-bold">My service requests</h1>
          <p className="mt-3 text-[#60757b]">HunarLink keeps every request and status update in one place.</p>
        </div>

        {requestsWithAssignments.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-[#cbdad3] bg-white p-12 text-center">
            <Wrench className="mx-auto text-[#c47b13]" />
            <h2 className="mt-4 text-xl font-bold">No requests yet</h2>
            <p className="mt-2 text-[#60757b]">Book your first HunarLink service and our team will take it from there.</p>
            <Link href="/book-service" className="mt-6 inline-flex rounded-xl bg-[#153443] px-5 py-3 font-bold text-white">
              Book a service
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {requestsWithAssignments.map((request) => (
              <article key={request.id} className="rounded-2xl border border-[#e3ece7] bg-white p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(request.status)}`}>
                        {formatStatus(request.status)}
                      </span>
                      {request.urgency !== 'NORMAL' && (
                        <span className="flex items-center gap-1 rounded-full bg-[#fff4df] px-3 py-1 text-xs font-bold text-[#9a6414]">
                          <CircleAlert /> {request.urgency}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-4 text-xl font-bold">{request.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-[#c47b13]">{request.category ?? 'HunarLink service'}</p>
                  </div>
                  <Link href={`/support?request=${request.id}`} className="text-sm font-bold text-[#d98d2b]">
                    Contact HunarLink
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap gap-4 border-t border-[#edf1ee] pt-4 text-sm text-[#60757b]">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{request.address}</span>
                  </div>
                  {request.preferredDate && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      <span>
                        {formatDate(request.preferredDate)}
                        {request.preferredTime && ` at ${request.preferredTime}`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4" />
                    <span>Requested {formatDate(request.createdAt)}</span>
                  </div>
                </div>

                {request.assignment && (
                  <div className="mt-5 rounded-xl border border-[#eaf5f0] bg-[#f0fdf4] p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-[#2f765b]" />
                      <span className="font-bold text-[#2f765b]">Professional Assigned</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar
                        name={request.assignment.professionalName}
                        image={request.assignment.professionalImage}
                        size="sm"
                      />
                      <div>
                        <p className="font-bold text-[#153443]">{request.assignment.professionalName}</p>
                        <p className="text-xs text-[#60757b]">{request.assignment.profession}</p>
                      </div>
                    </div>
                    {request.assignment.assignment.scheduledDate && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-[#60757b]">
                        <CalendarDays className="size-3" />
                        <span>
                          Scheduled: {formatDate(request.assignment.assignment.scheduledDate)}
                          {request.assignment.assignment.scheduledTime && ` at ${request.assignment.assignment.scheduledTime}`}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#60757b]">
                      <BriefcaseBusiness className="size-3" />
                      <span>Assignment Status: {formatStatus(request.assignment.assignment.status)}</span>
                    </div>
                  </div>
                )}

                {!request.assignment && request.status === 'REQUESTED' && (
                  <div className="mt-5 rounded-xl border border-[#fff5df] bg-[#fffdf5] p-4">
                    <div className="flex items-center gap-2">
                      <Clock3 className="size-5 text-[#d98d2b]" />
                      <span className="font-bold text-[#d98d2b]">Pending Assignment</span>
                    </div>
                    <p className="mt-2 text-sm text-[#60757b]">
                      HunarLink is reviewing your request and will assign a professional soon.
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
