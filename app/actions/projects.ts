'use server'

import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { completedProject, completedProjectImage, completedProjectTestimonial } from '@/lib/db/managed-schema'

const staffRoles = ['STAFF', 'ADMIN', 'SUPER_ADMIN']
const publicStatuses = ['PUBLISHED']

async function staff() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !staffRoles.includes(session.user.role ?? '')) throw new Error('Unauthorized')
  return session.user
}

export async function getPublishedProjects() {
  return db.select().from(completedProject).where(and(eq(completedProject.status, 'PUBLISHED'), eq(completedProject.clientPermissionStatus, 'APPROVED'))).orderBy(desc(completedProject.featured), desc(completedProject.completionDate))
}

export async function getProject(slug: string) {
  const rows = await db.select().from(completedProject).where(and(eq(completedProject.slug, slug), eq(completedProject.status, 'PUBLISHED'), eq(completedProject.clientPermissionStatus, 'APPROVED'))).limit(1)
  if (!rows[0]) return null
  const images = await db.select().from(completedProjectImage).where(eq(completedProjectImage.projectId, rows[0].id)).orderBy(completedProjectImage.displayOrder)
  const testimonials = await db.select().from(completedProjectTestimonial).where(and(eq(completedProjectTestimonial.projectId, rows[0].id), eq(completedProjectTestimonial.permissionStatus, 'APPROVED'), eq(completedProjectTestimonial.published, true))).limit(1)
  return { project: rows[0], images, testimonial: testimonials[0] ?? null }
}

export async function getAdminProjects() {
  try { await staff(); return db.select().from(completedProject).orderBy(desc(completedProject.updatedAt)) } catch { return [] }
}

export async function createProject(form: FormData) {
  const user = await staff()
  const title = String(form.get('title') ?? '').trim()
  const slug = String(form.get('slug') ?? title).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  if (!title || !slug) throw new Error('Title and slug are required')
  await db.insert(completedProject).values({ projectId: `HL-PROJECT-${Date.now()}`, title, slug, serviceCategory: String(form.get('serviceCategory') ?? 'Other'), projectType: String(form.get('projectType') ?? 'Other'), clientType: String(form.get('clientType') ?? 'Other'), clientName: String(form.get('clientName') ?? '') || undefined, displayClientPublicly: form.get('displayClientPublicly') === 'on', overview: String(form.get('overview') ?? ''), clientRequirement: String(form.get('clientRequirement') ?? ''), workPerformed: String(form.get('workPerformed') ?? ''), challenges: String(form.get('challenges') ?? '') || undefined, solution: String(form.get('solution') ?? ''), result: String(form.get('result') ?? ''), completionDate: String(form.get('completionDate') ?? '') || undefined, clientPermissionStatus: String(form.get('clientPermissionStatus') ?? 'NOT_REQUESTED'), status: 'DRAFT', createdBy: user.id, updatedBy: user.id })
  revalidatePath('/admin/our-work'); revalidatePath('/our-work')
}

export async function addProjectImage(form: FormData) {
  await staff()
  const projectId = String(form.get('projectId') ?? '')
  const imageUrl = String(form.get('imageUrl') ?? '')
  const altText = String(form.get('altText') ?? '').trim()
  if (!projectId || !imageUrl || !altText) throw new Error('Project, image, and alt text are required')
  await db.insert(completedProjectImage).values({ projectId, imageUrl, imageType: String(form.get('imageType') ?? 'GALLERY'), caption: String(form.get('caption') ?? '') || undefined, altText, displayOrder: Number(form.get('displayOrder') ?? 0) || 0 })
  revalidatePath('/admin/our-work'); revalidatePath('/our-work')
}

export async function updateProjectStatus(form: FormData) {
  const user = await staff()
  const id = String(form.get('id') ?? '')
  const status = String(form.get('status') ?? 'DRAFT')
  const permission = String(form.get('clientPermissionStatus') ?? 'NOT_REQUESTED')
  if (!id || !['DRAFT', 'INTERNAL_REVIEW', 'CLIENT_PERMISSION_PENDING', 'READY_TO_PUBLISH', 'PUBLISHED', 'ARCHIVED'].includes(status)) throw new Error('Invalid project update')
  if (status === 'PUBLISHED' && permission !== 'APPROVED') throw new Error('Client permission must be approved before publishing')
  await db.update(completedProject).set({ status, clientPermissionStatus: permission, updatedBy: user.id, updatedAt: new Date(), publishedAt: status === 'PUBLISHED' ? new Date() : null }).where(eq(completedProject.id, id))
  revalidatePath('/admin/our-work'); revalidatePath('/our-work')
}

export async function deleteProject(form: FormData) {
  await staff()
  const id = String(form.get('id') ?? '')
  if (!id) throw new Error('Project ID is required')
  await db.delete(completedProjectTestimonial).where(eq(completedProjectTestimonial.projectId, id))
  await db.delete(completedProjectImage).where(eq(completedProjectImage.projectId, id))
  await db.delete(completedProject).where(eq(completedProject.id, id))
  revalidatePath('/admin/our-work'); revalidatePath('/our-work')
}
