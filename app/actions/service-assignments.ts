"use server";

import { eq, and, desc, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, workerProfile } from "@/lib/db/schema";
import { professionalProfile, serviceRequest, serviceAssignment, serviceStatusHistory } from "@/lib/db/managed-schema";
import { assignmentStatuses, assignmentPriorities, notification } from "@/lib/db/managed-schema";
import { requireStaff } from "@/lib/auth/staff";

const assignProfessionalSchema = z.object({
  serviceRequestId: z.string().uuid(),
  professionalId: z.string().uuid(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(assignmentPriorities).optional(),
});

const updateAssignmentStatusSchema = z.object({
  assignmentId: z.string().uuid(),
  status: z.enum(assignmentStatuses),
});

const reassignProfessionalSchema = z.object({
  assignmentId: z.string().uuid(),
  newProfessionalId: z.string().uuid(),
  notes: z.string().optional(),
});

async function getAssignableProfessionalsInternal() {
  // Get professionals who are:
  // - Approved (verificationStatus = VERIFIED in workerProfile)
  // - Active (user.status = ACTIVE)
  // Check both professionalProfile and workerProfile tables
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
    );

  return professionals;
}

export async function getAssignableProfessionalsForService(serviceRequestId: string) {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  // Get the service request to find the category
  const [request] = await db
    .select({ categoryId: serviceRequest.categoryId })
    .from(serviceRequest)
    .where(eq(serviceRequest.id, serviceRequestId))
    .limit(1);

  if (!request) {
    return {
      ok: false as const,
      message: "Service request not found.",
    };
  }

  const professionals = await getAssignableProfessionalsInternal();

  return {
    ok: true as const,
    professionals,
  };
}

export async function assignProfessional(input: z.infer<typeof assignProfessionalSchema>) {
  const parsed = assignProfessionalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Invalid input data.",
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

  const { serviceRequestId, professionalId, scheduledDate, scheduledTime, notes, priority } = parsed.data;

  // Check if the service request exists
  const [request] = await db
    .select({ status: serviceRequest.status, title: serviceRequest.title })
    .from(serviceRequest)
    .where(eq(serviceRequest.id, serviceRequestId))
    .limit(1);

  if (!request) {
    return {
      ok: false as const,
      message: "Service request not found.",
    };
  }

  // Check if there's already an active assignment
  const [existingAssignment] = await db
    .select()
    .from(serviceAssignment)
    .where(
      and(
        eq(serviceAssignment.serviceRequestId, serviceRequestId),
        inArray(serviceAssignment.status, ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"])
      )
    )
    .limit(1);

  if (existingAssignment) {
    return {
      ok: false as const,
      message: "This service request already has an active assignment.",
    };
  }

  // Verify the professional is assignable
  const professionals = await getAssignableProfessionalsInternal();

  const isProfessionalAssignable = professionals.some(
    (p) => (p.profile?.id === professionalId) || (p.workerProfile.id === professionalId)
  );

  if (!isProfessionalAssignable) {
    return {
      ok: false as const,
      message: "Professional is not approved or does not match the service category.",
    };
  }

  // Create the assignment
  const [assignment] = await db
    .insert(serviceAssignment)
    .values({
      serviceRequestId,
      professionalId,
      assignedBy: adminId,
      status: "ASSIGNED",
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString().split('T')[0] : null,
      scheduledTime,
      notes,
      priority: priority || "NORMAL",
    })
    .returning();

  // Update service request status
  await db
    .update(serviceRequest)
    .set({ status: "ASSIGNED", updatedAt: new Date() })
    .where(eq(serviceRequest.id, serviceRequestId));

  // Record status history
  await db.insert(serviceStatusHistory).values({
    serviceRequestId,
    previousStatus: request.status,
    newStatus: "ASSIGNED",
    changedBy: adminId,
    note: `Assigned to professional ${professionalId}`,
  });

  // Send notification to professional
  await db.insert(notification).values({
    userId: (await db.select({ userId: professionalProfile.userId }).from(professionalProfile).where(eq(professionalProfile.id, professionalId)).limit(1))[0]?.userId || "",
    type: "ASSIGNMENT",
    title: "New Service Assignment",
    message: `You have been assigned a new service request: ${request.title}`,
  });

  return {
    ok: true as const,
    assignment,
    message: "Professional assigned successfully.",
  };
}

export async function getProfessionalAssignments() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return {
      ok: false as const,
      message: "You must be authenticated to view assignments.",
    };
  }

  // Check if user has PROFESSIONAL role (approved) or pending workerProfile
  const hasRole = session.user.role === "PROFESSIONAL";
  
  if (!hasRole) {
    const [workerProf] = await db
      .select()
      .from(workerProfile)
      .where(eq(workerProfile.userId, session.user.id))
      .limit(1);

    if (!workerProf || workerProf.verificationStatus !== "VERIFIED") {
      return {
        ok: false as const,
        message: "Only verified professionals can view their assignments.",
      };
    }
  }

  // Get the worker profile ID for assignment lookup
  const [workerProf] = await db
    .select({ id: workerProfile.id })
    .from(workerProfile)
    .where(eq(workerProfile.userId, session.user.id))
    .limit(1);

  if (!workerProf) {
    return {
      ok: false as const,
      message: "Professional profile not found.",
    };
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
        preferredDate: serviceRequest.preferredDate,
        preferredTime: serviceRequest.preferredTime,
      },
    })
    .from(serviceAssignment)
    .innerJoin(serviceRequest, eq(serviceRequest.id, serviceAssignment.serviceRequestId))
    .where(eq(serviceAssignment.professionalId, workerProf.id))
    .orderBy(desc(serviceAssignment.assignedAt));

  return {
    ok: true as const,
    assignments,
  };
}

export async function updateAssignmentStatus(formData: FormData) {
  const assignmentId = formData.get("assignmentId") as string;
  const status = formData.get("status") as string;

  const parsed = updateAssignmentStatusSchema.safeParse({ assignmentId, status });
  if (!parsed.success) {
    throw new Error("Invalid input data.");
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("You must be authenticated to perform this action.");
  }

  // Check if user is verified professional
  const hasRole = session.user.role === "PROFESSIONAL";
  
  if (!hasRole) {
    const [workerProf] = await db
      .select()
      .from(workerProfile)
      .where(eq(workerProfile.userId, session.user.id))
      .limit(1);

    if (!workerProf || workerProf.verificationStatus !== "VERIFIED") {
      throw new Error("Only verified professionals can update assignments.");
    }
  }

  // Get the worker profile ID for the current user
  const [workerProf] = await db
    .select({ id: workerProfile.id })
    .from(workerProfile)
    .where(eq(workerProfile.userId, session.user.id))
    .limit(1);

  if (!workerProf) {
    throw new Error("Professional profile not found.");
  }

  // Get the assignment
  const [assignment] = await db
    .select({
      assignment: serviceAssignment,
      professionalId: serviceAssignment.professionalId,
    })
    .from(serviceAssignment)
    .where(eq(serviceAssignment.id, assignmentId))
    .limit(1);

  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  // Verify the professional owns this assignment
  if (workerProf.id !== assignment.professionalId) {
    throw new Error("You do not have permission to update this assignment.");
  }

  // Validate status transitions
  const currentStatus = assignment.assignment.status;
  const validTransitions: Record<string, string[]> = {
    ASSIGNED: ["ACCEPTED", "REJECTED", "CANCELLED"],
    ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
    REJECTED: [],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!validTransitions[currentStatus]?.includes(status)) {
    throw new Error(`Cannot transition from ${currentStatus} to ${status}.`);
  }

  // Update the assignment
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === "ACCEPTED") {
    updateData.respondedAt = new Date();
  } else if (status === "IN_PROGRESS") {
    updateData.startedAt = new Date();
  } else if (status === "COMPLETED") {
    updateData.completedAt = new Date();
  }

  await db
    .update(serviceAssignment)
    .set(updateData)
    .where(eq(serviceAssignment.id, assignmentId));

  // Update service request status accordingly
  const statusMapping: Record<string, string> = {
    ACCEPTED: "CONFIRMED",
    IN_PROGRESS: "SERVICE_STARTED",
    COMPLETED: "SERVICE_COMPLETED",
  };

  if (statusMapping[status]) {
    await db
      .update(serviceRequest)
      .set({ status: statusMapping[status], updatedAt: new Date() })
      .where(eq(serviceRequest.id, assignment.assignment.serviceRequestId));
  }

  // Send notifications based on status change
  if (status === "ACCEPTED") {
    // Notify admin
    await db.insert(notification).values({
      userId: assignment.assignment.assignedBy,
      type: "ASSIGNMENT_UPDATE",
      title: "Professional Accepted Assignment",
      message: `Professional has accepted the service assignment`,
    });
  } else if (status === "IN_PROGRESS") {
    // Get customer ID from service request
    const [serviceReq] = await db
      .select({ customerId: serviceRequest.customerId })
      .from(serviceRequest)
      .where(eq(serviceRequest.id, assignment.assignment.serviceRequestId))
      .limit(1);

    if (serviceReq) {
      await db.insert(notification).values({
        userId: serviceReq.customerId,
        type: "SERVICE_UPDATE",
        title: "Service In Progress",
        message: `Your service is now in progress`,
      });
    }
  } else if (status === "COMPLETED") {
    // Get customer ID from service request
    const [serviceReq] = await db
      .select({ customerId: serviceRequest.customerId })
      .from(serviceRequest)
      .where(eq(serviceRequest.id, assignment.assignment.serviceRequestId))
      .limit(1);

    if (serviceReq) {
      await db.insert(notification).values({
        userId: serviceReq.customerId,
        type: "SERVICE_UPDATE",
        title: "Service Completed",
        message: `Your service has been completed. Please review your experience.`,
      });
    }
  }
}

export async function reassignProfessional(input: z.infer<typeof reassignProfessionalSchema>) {
  const parsed = reassignProfessionalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Invalid input data.",
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

  const { assignmentId, newProfessionalId, notes } = parsed.data;

  // Get the current assignment
  const [currentAssignment] = await db
    .select({
      assignment: serviceAssignment,
      serviceRequestId: serviceRequest.id,
      currentCategoryId: serviceRequest.categoryId,
    })
    .from(serviceAssignment)
    .innerJoin(serviceRequest, eq(serviceRequest.id, serviceAssignment.serviceRequestId))
    .where(eq(serviceAssignment.id, assignmentId))
    .limit(1);

  if (!currentAssignment) {
    return {
      ok: false as const,
      message: "Assignment not found.",
    };
  }

  // Verify the new professional is assignable
  const professionals = await getAssignableProfessionalsInternal();
  const isProfessionalAssignable = professionals.some(
    (p) => (p.profile?.id === newProfessionalId) || (p.workerProfile.id === newProfessionalId)
  );

  if (!isProfessionalAssignable) {
    return {
      ok: false as const,
      message: "New professional is not approved or does not match the service category.",
    };
  }

  // Mark current assignment as cancelled
  await db
    .update(serviceAssignment)
    .set({
      status: "CANCELLED",
      notes: (currentAssignment.assignment.notes || "") + `\n\nReassigned by admin. ${notes || ""}`,
    })
    .where(eq(serviceAssignment.id, assignmentId));

  // Create new assignment
  const [newAssignment] = await db
    .insert(serviceAssignment)
    .values({
      serviceRequestId: currentAssignment.serviceRequestId,
      professionalId: newProfessionalId,
      assignedBy: adminId,
      status: "ASSIGNED",
      scheduledDate: currentAssignment.assignment.scheduledDate,
      scheduledTime: currentAssignment.assignment.scheduledTime,
      notes: notes || currentAssignment.assignment.notes,
      priority: currentAssignment.assignment.priority,
    })
    .returning();

  // Record status history
  await db.insert(serviceStatusHistory).values({
    serviceRequestId: currentAssignment.serviceRequestId,
    previousStatus: "ASSIGNED",
    newStatus: "ASSIGNED",
    changedBy: adminId,
    note: `Reassigned from previous professional to ${newProfessionalId}`,
  });

  // Send notification to new professional
  const newProfessionalUserId = (await db.select({ userId: professionalProfile.userId }).from(professionalProfile).where(eq(professionalProfile.id, newProfessionalId)).limit(1))[0]?.userId || "";
  if (newProfessionalUserId) {
    await db.insert(notification).values({
      userId: newProfessionalUserId,
      type: "ASSIGNMENT",
      title: "New Service Assignment",
      message: `You have been assigned a service request (reassignment)`,
    });
  }

  return {
    ok: true as const,
    assignment: newAssignment,
    message: "Work reassigned successfully.",
  };
}

export async function getAssignmentHistory(serviceRequestId: string) {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  const history = await db
    .select({
      history: serviceStatusHistory,
      assignment: serviceAssignment,
      adminName: user.name,
    })
    .from(serviceStatusHistory)
    .leftJoin(serviceAssignment, eq(serviceAssignment.serviceRequestId, serviceStatusHistory.serviceRequestId))
    .leftJoin(user, eq(user.id, serviceStatusHistory.changedBy))
    .where(eq(serviceStatusHistory.serviceRequestId, serviceRequestId))
    .orderBy(desc(serviceStatusHistory.createdAt));

  return {
    ok: true as const,
    history,
  };
}

export async function getAssignmentByServiceRequestId(serviceRequestId: string) {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "Staff access required.",
    };
  }

  const [assignment] = await db
    .select()
    .from(serviceAssignment)
    .where(eq(serviceAssignment.serviceRequestId, serviceRequestId))
    .limit(1);

  return {
    ok: true as const,
    assignment,
  };
}
