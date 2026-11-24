"use server";

import { and, desc, eq, like, or } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, serviceCategory, workerProfile } from "@/lib/db/schema";
import {
  serviceRequest,
  serviceAssignment,
  serviceStatusHistory,
  professionalProfile,
  notification,
  assignmentPriorities,
} from "@/lib/db/managed-schema";
import { requireStaff } from "@/lib/auth/staff";


const getAssignmentsSchema = z.object({
  status: z.string().optional(),
  professionalId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
});

const createDirectTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  categoryId: z.string().uuid(),
  customerId: z.string().optional(),
  professionalId: z.string().uuid(),
  address: z.string().min(1, "Address is required"),
  urgency: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  priority: z.enum(assignmentPriorities).default("NORMAL"),
  notes: z.string().optional(),
  budget: z.number().int().optional(),
});

export async function getAllAssignments(filters?: z.infer<typeof getAssignmentsSchema>) {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  const parsed = getAssignmentsSchema.safeParse(filters || {});
  const filtersData = parsed.success ? parsed.data : {};

  const conditions = [];

  if (filtersData.status) {
    conditions.push(eq(serviceAssignment.status, filtersData.status));
  }

  if (filtersData.professionalId) {
    conditions.push(eq(serviceAssignment.professionalId, filtersData.professionalId));
  }

  if (filtersData.categoryId) {
    conditions.push(eq(serviceRequest.categoryId, filtersData.categoryId));
  }

  if (filtersData.search) {
    const searchTerm = `%${filtersData.search}%`;
    conditions.push(
      or(
        like(serviceRequest.title, searchTerm),
        like(user.name, searchTerm),
        like(serviceRequest.address, searchTerm)
      )
    );
  }

  const assignments = await db
    .select({
      assignment: serviceAssignment,
      request: {
        id: serviceRequest.id,
        title: serviceRequest.title,
        description: serviceRequest.description,
        address: serviceRequest.address,
        urgency: serviceRequest.urgency,
        status: serviceRequest.status,
        preferredDate: serviceRequest.preferredDate,
        preferredTime: serviceRequest.preferredTime,
      },
      category: serviceCategory,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      professional: {
        id: professionalProfile.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        profession: workerProfile.profession,
      },
    })
    .from(serviceAssignment)
    .innerJoin(serviceRequest, eq(serviceRequest.id, serviceAssignment.serviceRequestId))
    .innerJoin(serviceCategory, eq(serviceCategory.id, serviceRequest.categoryId))
    .innerJoin(user, eq(user.id, serviceRequest.customerId))
    .innerJoin(professionalProfile, eq(professionalProfile.id, serviceAssignment.professionalId))
    .innerJoin(user, eq(user.id, professionalProfile.userId))
    .innerJoin(workerProfile, eq(workerProfile.userId, professionalProfile.userId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(serviceAssignment.assignedAt));

  return {
    ok: true as const,
    assignments,
  };
}

export async function getAssignmentStats() {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  const [totalResult] = await db
    .select({ count: serviceAssignment.id })
    .from(serviceAssignment);

  const [assignedResult] = await db
    .select({ count: serviceAssignment.id })
    .from(serviceAssignment)
    .where(eq(serviceAssignment.status, "ASSIGNED"));

  const [inProgressResult] = await db
    .select({ count: serviceAssignment.id })
    .from(serviceAssignment)
    .where(eq(serviceAssignment.status, "IN_PROGRESS"));

  const [completedResult] = await db
    .select({ count: serviceAssignment.id })
    .from(serviceAssignment)
    .where(eq(serviceAssignment.status, "COMPLETED"));

  return {
    ok: true as const,
    stats: {
      total: Number(totalResult?.count || 0),
      assigned: Number(assignedResult?.count || 0),
      inProgress: Number(inProgressResult?.count || 0),
      completed: Number(completedResult?.count || 0),
    },
  };
}

export async function getAllAssignableProfessionals() {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  // Use workerProfile as primary table to include all verified professionals
  const professionals = await db
    .select({
      profile: professionalProfile,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        status: user.status,
      },
      workerProfile: {
        id: workerProfile.id,
        profession: workerProfile.profession,
        experienceYears: workerProfile.experienceYears,
        verificationStatus: workerProfile.verificationStatus,
        availabilityStatus: workerProfile.availabilityStatus,
      },
    })
    .from(workerProfile)
    .innerJoin(user, eq(user.id, workerProfile.userId))
    .leftJoin(professionalProfile, eq(professionalProfile.userId, workerProfile.userId))
    .where(
      and(
        eq(workerProfile.verificationStatus, "VERIFIED"),
        eq(user.status, "ACTIVE")
      )
    )
    .orderBy(desc(workerProfile.createdAt));

  return {
    ok: true as const,
    professionals,
  };
}

export async function createDirectTask(input: z.infer<typeof createDirectTaskSchema>) {
  const parsed = createDirectTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message || "Invalid input data.",
    };
  }

  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const adminId = session?.user?.id;

  if (!adminId) {
    return {
      ok: false as const,
      message: "You must be authenticated to perform this action.",
    };
  }

  const {
    title,
    description,
    categoryId,
    customerId,
    professionalId,
    address,
    urgency,
    scheduledDate,
    scheduledTime,
    priority,
    notes,
  } = parsed.data;

  // Verify the professional is assignable
  const [professional] = await db
    .select({
      profile: professionalProfile,
      userProfile: {
        id: user.id,
        status: user.status,
      },
      workerProfile: {
        id: workerProfile.id,
        verificationStatus: workerProfile.verificationStatus,
      },
    })
    .from(workerProfile)
    .innerJoin(user, eq(user.id, workerProfile.userId))
    .leftJoin(professionalProfile, eq(professionalProfile.userId, workerProfile.userId))
    .where(eq(workerProfile.id, professionalId))
    .limit(1);

  if (!professional) {
    return {
      ok: false as const,
      message: "Professional not found.",
    };
  }

  // Check eligibility based on workerProfile verification (primary) or professionalProfile status
  const isVerified = professional.workerProfile.verificationStatus === "VERIFIED";
  const isApproved = professional.profile?.status === "APPROVED" || !professional.profile;
  const isActive = professional.userProfile.status === "ACTIVE";

  if (!isVerified || !isApproved || !isActive) {
    return {
      ok: false as const,
      message: "Professional is not eligible for assignment.",
    };
  }

  // Create service request (use admin ID as customer if none provided)
  const [request] = await db
    .insert(serviceRequest)
    .values({
      customerId: customerId || adminId,
      categoryId,
      title,
      description,
      address,
      urgency,
      preferredDate: scheduledDate ? new Date(scheduledDate) : null,
      preferredTime: scheduledTime || null,
      status: "ASSIGNED",
    })
    .returning();

  // Create assignment
  const [assignment] = await db
    .insert(serviceAssignment)
    .values({
      serviceRequestId: request.id,
      professionalId,
      assignedBy: adminId,
      status: "ASSIGNED",
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString().split('T')[0] : null,
      scheduledTime,
      notes,
      priority,
    })
    .returning();

  // Record status history
  await db.insert(serviceStatusHistory).values({
    serviceRequestId: request.id,
    previousStatus: null,
    newStatus: "ASSIGNED",
    changedBy: adminId,
    note: "Direct task created by admin",
  });

  // Send notification to professional
  await db.insert(notification).values({
    userId: professional.userProfile.id,
    type: "ASSIGNMENT",
    title: "New Task Assignment",
    message: `You have been assigned a new task: ${title}`,
  });

  return {
    ok: true as const,
    assignment,
    request,
    message: "Task created and assigned successfully.",
  };
}

export async function getServiceCategories() {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  const categories = await db
    .select()
    .from(serviceCategory)
    .where(eq(serviceCategory.active, true))
    .orderBy(serviceCategory.name);

  return {
    ok: true as const,
    categories,
  };
}

export async function syncProfessionalProfiles() {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  // Get all verified worker profiles that don't have professionalProfile entries
  const verifiedWorkers = await db
    .select({
      userId: workerProfile.userId,
      profession: workerProfile.profession,
      bio: workerProfile.bio,
      experienceYears: workerProfile.experienceYears,
      verificationStatus: workerProfile.verificationStatus,
      availabilityStatus: workerProfile.availabilityStatus,
      verifiedAt: workerProfile.verifiedAt,
      approvedBy: workerProfile.approvedBy,
      approvedAt: workerProfile.approvedAt,
    })
    .from(workerProfile)
    .where(eq(workerProfile.verificationStatus, "VERIFIED"));

  let synced = 0;
  let skipped = 0;

  for (const worker of verifiedWorkers) {
    // Check if professionalProfile entry exists
    const [existing] = await db
      .select()
      .from(professionalProfile)
      .where(eq(professionalProfile.userId, worker.userId))
      .limit(1);

    if (existing) {
      skipped++;
    } else {
      await db.insert(professionalProfile).values({
        userId: worker.userId,
        profession: worker.profession,
        bio: worker.bio,
        experienceYears: worker.experienceYears,
        status: "APPROVED",
        verificationStatus: worker.verificationStatus,
        availabilityStatus: worker.availabilityStatus,
        updatedAt: new Date(),
      });
      synced++;
    }
  }

  return {
    ok: true as const,
    message: `Synced ${synced} professional profiles. Skipped ${skipped} existing entries.`,
    synced,
    skipped,
  };
}
