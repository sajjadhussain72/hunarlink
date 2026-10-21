"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  completedProject,
  completedProjectImage,
  completedProjectTestimonial,
} from "@/lib/db/managed-schema";
import { requireStaff } from "@/lib/auth/staff";

export async function getPublishedProjects() {
  return db
    .select()
    .from(completedProject)
    .where(
      and(
        eq(completedProject.status, "PUBLISHED"),
        eq(completedProject.clientPermissionStatus, "APPROVED"),
      ),
    )
    .orderBy(
      desc(completedProject.featured),
      desc(completedProject.completionDate),
    );
}

export async function getProject(slug: string) {
  const rows = await db
    .select()
    .from(completedProject)
    .where(
      and(
        eq(completedProject.slug, slug),
        eq(completedProject.status, "PUBLISHED"),
        eq(completedProject.clientPermissionStatus, "APPROVED"),
      ),
    )
    .limit(1);
  if (!rows[0]) return null;
  const images = await db
    .select()
    .from(completedProjectImage)
    .where(eq(completedProjectImage.projectId, rows[0].id))
    .orderBy(completedProjectImage.displayOrder);
  const testimonials = await db
    .select()
    .from(completedProjectTestimonial)
    .where(
      and(
        eq(completedProjectTestimonial.projectId, rows[0].id),
        eq(completedProjectTestimonial.permissionStatus, "APPROVED"),
        eq(completedProjectTestimonial.published, true),
      ),
    )
    .limit(1);
  return { project: rows[0], images, testimonial: testimonials[0] ?? null };
}

export async function getAdminProjects() {
  try {
    await requireStaff();
    return db
      .select()
      .from(completedProject)
      .orderBy(desc(completedProject.updatedAt));
  } catch {
    return [];
  }
}
