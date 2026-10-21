"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { completedProject, completedProjectImage } from "@/lib/db/managed-schema";
import { requireStaff } from "@/lib/auth/staff";

export async function createProject(form: FormData) {
  const user = await requireStaff();
  const title = String(form.get("title") ?? "").trim();
  const slug = String(form.get("slug") ?? title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  if (!title || !slug) throw new Error("Title and slug are required");
  await db
    .insert(completedProject)
    .values({
      projectId: `HL-PROJECT-${Date.now()}`,
      title,
      slug,
      serviceCategory: String(form.get("serviceCategory") ?? "Other"),
      projectType: String(form.get("projectType") ?? "Other"),
      clientType: String(form.get("clientType") ?? "Other"),
      clientName: String(form.get("clientName") ?? "") || undefined,
      displayClientPublicly: form.get("displayClientPublicly") === "on",
      overview: String(form.get("overview") ?? ""),
      clientRequirement: String(form.get("clientRequirement") ?? ""),
      workPerformed: String(form.get("workPerformed") ?? ""),
      challenges: String(form.get("challenges") ?? "") || undefined,
      solution: String(form.get("solution") ?? ""),
      result: String(form.get("result") ?? ""),
      completionDate: String(form.get("completionDate") ?? "") || undefined,
      clientPermissionStatus: String(
        form.get("clientPermissionStatus") ?? "NOT_REQUESTED",
      ),
      status: "DRAFT",
      createdBy: user.id,
      updatedBy: user.id,
    });
  revalidatePath("/admin/our-work");
  revalidatePath("/our-work");
}

export async function addProjectImage(form: FormData) {
  await requireStaff();
  const projectId = String(form.get("projectId") ?? "");
  const imageUrl = String(form.get("imageUrl") ?? "");
  const altText = String(form.get("altText") ?? "").trim();
  if (!projectId || !imageUrl || !altText)
    throw new Error("Project, image, and alt text are required");
  await db
    .insert(completedProjectImage)
    .values({
      projectId,
      imageUrl,
      imageType: String(form.get("imageType") ?? "GALLERY"),
      caption: String(form.get("caption") ?? "") || undefined,
      altText,
      displayOrder: Number(form.get("displayOrder") ?? 0) || 0,
    });
  revalidatePath("/admin/our-work");
  revalidatePath("/our-work");
}
