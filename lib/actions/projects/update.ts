"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  completedProject,
  completedProjectImage,
  completedProjectTestimonial,
} from "@/lib/db/managed-schema";
import { requireStaff } from "@/lib/auth/staff";

export async function updateProjectStatus(form: FormData) {
  const user = await requireStaff();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "DRAFT");
  const permission = String(
    form.get("clientPermissionStatus") ?? "NOT_REQUESTED",
  );
  if (
    !id ||
    ![
      "DRAFT",
      "INTERNAL_REVIEW",
      "CLIENT_PERMISSION_PENDING",
      "READY_TO_PUBLISH",
      "PUBLISHED",
      "ARCHIVED",
    ].includes(status)
  )
    throw new Error("Invalid project update");
  if (status === "PUBLISHED" && permission !== "APPROVED")
    throw new Error("Client permission must be approved before publishing");
  await db
    .update(completedProject)
    .set({
      status,
      clientPermissionStatus: permission,
      updatedBy: user.id,
      updatedAt: new Date(),
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    })
    .where(eq(completedProject.id, id));
  revalidatePath("/admin/our-work");
  revalidatePath("/our-work");
}

export async function deleteProject(form: FormData) {
  await requireStaff();
  const id = String(form.get("id") ?? "");
  if (!id) throw new Error("Project ID is required");
  await db
    .delete(completedProjectTestimonial)
    .where(eq(completedProjectTestimonial.projectId, id));
  await db
    .delete(completedProjectImage)
    .where(eq(completedProjectImage.projectId, id));
  await db.delete(completedProject).where(eq(completedProject.id, id));
  revalidatePath("/admin/our-work");
  revalidatePath("/our-work");
}
