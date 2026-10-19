'use server'

import { and, asc, eq, isNull } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { serviceLocation } from '@/lib/db/location-schema'

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const [staff] = await db.select({ id: user.id, role: user.role }).from(user).where(eq(user.id, session.user.id)).limit(1)
  return staff && ['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(staff.role) ? staff : null
}

export async function getLocations() { return db.select().from(serviceLocation).orderBy(asc(serviceLocation.region), asc(serviceLocation.name)) }
export async function getCustomerLocations() { return db.select().from(serviceLocation).where(and(eq(serviceLocation.active, true), eq(serviceLocation.serviceAvailable, true))).orderBy(asc(serviceLocation.region), asc(serviceLocation.name)) }
export async function createLocation(input: { name: string; region: string; description?: string }) { const staff = await requireStaff(); if (!staff) return { ok: false as const, message: 'Staff access required.' }; const name = input.name.trim(); if (!name || !input.region.trim()) return { ok: false as const, message: 'Name and region are required.' }; await db.insert(serviceLocation).values({ name, region: input.region.trim(), description: input.description?.trim() || null }); revalidatePath('/admin/locations'); return { ok: true as const } }
export async function toggleLocation(id: string, field: 'active' | 'serviceAvailable') { const staff = await requireStaff(); if (!staff) return { ok: false as const, message: 'Staff access required.' }; const [location] = await db.select().from(serviceLocation).where(eq(serviceLocation.id, id)).limit(1); if (!location) return { ok: false as const, message: 'Location not found.' }; await db.update(serviceLocation).set({ [field]: !location[field], updatedAt: new Date() }).where(eq(serviceLocation.id, id)); revalidatePath('/admin/locations'); return { ok: true as const } }
export type LocationRows = Awaited<ReturnType<typeof getLocations>>
