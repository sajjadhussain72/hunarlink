'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { and, desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { customerProfile, serviceCategory, serviceRequest, serviceStatusHistory, serviceStatuses, type ServiceStatus } from '@/lib/db/managed-schema'

const requestSchema = z.object({
  categorySlug: z.string().min(1), locationId: z.string().uuid().optional(), title: z.string().trim().min(3).max(120), description: z.string().trim().min(10).max(2000), urgency: z.enum(['NORMAL', 'URGENT', 'EMERGENCY']), address: z.string().trim().min(5).max(300), preferredDate: z.string().optional(), preferredTime: z.string().max(40).optional(), areaId: z.string().uuid().optional(), districtId: z.string().uuid().optional(), cityTownId: z.string().uuid().optional(),
})

export async function createServiceRequest(input: z.infer<typeof requestSchema>) {
  const parsed = requestSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: 'Please check the request details and try again.' }
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false, message: 'Please sign in to book a HunarLink service.' }
  const [category] = await db.select({ id: serviceCategory.id }).from(serviceCategory).where(and(eq(serviceCategory.slug, parsed.data.categorySlug), eq(serviceCategory.active, true))).limit(1)
  if (!category) return { ok: false, message: 'That service is not currently available.' }
  const [request] = await db.insert(serviceRequest).values({ customerId: session.user.id, categoryId: category.id, title: parsed.data.title, description: parsed.data.description, urgency: parsed.data.urgency, address: parsed.data.address, preferredDate: parsed.data.preferredDate ? new Date(`${parsed.data.preferredDate}T00:00:00Z`) : undefined, preferredTime: parsed.data.preferredTime || undefined, locationId: parsed.data.locationId, areaId: parsed.data.areaId, districtId: parsed.data.districtId, cityTownId: parsed.data.cityTownId }).returning({ id: serviceRequest.id })
  await db.insert(serviceStatusHistory).values({ serviceRequestId: request.id, newStatus: 'REQUESTED', changedBy: session.user.id, note: 'Request submitted by customer' })
  await db.insert(customerProfile).values({ userId: session.user.id }).onConflictDoNothing()
  revalidatePath('/dashboard')
  return { ok: true, requestId: request.id }
}

export async function requireCustomer() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?next=/book-service')
  return session
}
