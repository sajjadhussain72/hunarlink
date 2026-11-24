"use server";

import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, workerProfile } from "@/lib/db/schema";
import { professionalProfile } from "@/lib/db/managed-schema";
import { requireStaff } from "@/lib/auth/staff";
import { requirePermission, ADMIN_PERMISSIONS } from "@/lib/auth/permissions";

const approveProfessionalSchema = z.object({
  profileId: z.string().uuid(),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().optional(),
});

export async function getPendingProfessionals() {
  const staff = await requireStaff();
  if (!staff) {
    return {
      ok: false as const,
      message: "You do not have permission to view professional applications.",
    };
  }

  const pendingProfiles = await db
    .select({
      profile: workerProfile,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        status: user.status,
      },
    })
    .from(workerProfile)
    .innerJoin(user, eq(user.id, workerProfile.userId))
    .where(eq(workerProfile.verificationStatus, "PENDING"))
    .orderBy(desc(workerProfile.createdAt));

  return { ok: true as const, professionals: pendingProfiles };
}

export async function approveProfessional(input: z.infer<typeof approveProfessionalSchema>) {
  const parsed = approveProfessionalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Invalid input data.",
    };
  }

  // Check permission
  const permission = parsed.data.action === "APPROVE"
    ? ADMIN_PERMISSIONS.PROFESSIONAL_APPROVE
    : ADMIN_PERMISSIONS.PROFESSIONAL_REJECT;

  try {
    await requirePermission(permission);
  } catch {
    return {
      ok: false as const,
      message: `You do not have permission to ${parsed.data.action.toLowerCase()} professional accounts.`,
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

  const { profileId, action, rejectionReason } = parsed.data;

  // Get the profile to find the user ID
  const [profile] = await db
    .select({ userId: workerProfile.userId })
    .from(workerProfile)
    .where(eq(workerProfile.id, profileId))
    .limit(1);

  if (!profile) {
    return {
      ok: false as const,
      message: "Professional profile not found.",
    };
  }

  if (action === "APPROVE") {
    // Update worker profile
    await db
      .update(workerProfile)
      .set({
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        approvedBy: adminId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workerProfile.id, profileId));

    // Update user role to PROFESSIONAL
    await db
      .update(user)
      .set({
        role: "PROFESSIONAL",
        updatedAt: new Date(),
      })
      .where(eq(user.id, profile.userId));

    // Get worker profile details for professionalProfile
    const [workerProf] = await db
      .select({
        profession: workerProfile.profession,
        bio: workerProfile.bio,
        experienceYears: workerProfile.experienceYears,
      })
      .from(workerProfile)
      .where(eq(workerProfile.id, profileId))
      .limit(1);

    // Create or update professionalProfile entry
    const [existingProfProfile] = await db
      .select()
      .from(professionalProfile)
      .where(eq(professionalProfile.userId, profile.userId))
      .limit(1);

    if (existingProfProfile) {
      await db
        .update(professionalProfile)
        .set({
          status: "APPROVED",
          verificationStatus: "VERIFIED",
          profession: workerProf?.profession || "",
          bio: workerProf?.bio || null,
          experienceYears: workerProf?.experienceYears || 0,
          updatedAt: new Date(),
        })
        .where(eq(professionalProfile.userId, profile.userId));
    } else {
      await db
        .insert(professionalProfile)
        .values({
          userId: profile.userId,
          profession: workerProf?.profession || "",
          bio: workerProf?.bio || null,
          experienceYears: workerProf?.experienceYears || 0,
          status: "APPROVED",
          verificationStatus: "VERIFIED",
          availabilityStatus: "OFFLINE",
          updatedAt: new Date(),
        });
    }

    return {
      ok: true as const,
      message: "Professional account approved successfully.",
    };
  } else {
    // REJECT
    await db
      .update(workerProfile)
      .set({
        verificationStatus: "REJECTED",
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: rejectionReason || null,
        updatedAt: new Date(),
      })
      .where(eq(workerProfile.id, profileId));

    return {
      ok: true as const,
      message: "Professional application rejected.",
    };
  }
}

export async function getProfessionalProfile(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return {
      ok: false as const,
      message: "You must be authenticated to view this profile.",
    };
  }

  const [profile] = await db
    .select({
      profile: workerProfile,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
        status: user.status,
      },
    })
    .from(workerProfile)
    .innerJoin(user, eq(user.id, workerProfile.userId))
    .where(eq(workerProfile.userId, userId))
    .limit(1);

  if (!profile) {
    return {
      ok: false as const,
      message: "Professional profile not found.",
    };
  }

  // Only allow the user themselves or staff to view
  const isOwnProfile = profile.user.id === session.user.id;
  const isStaff = ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(session.user.role ?? "");

  if (!isOwnProfile && !isStaff) {
    return {
      ok: false as const,
      message: "You do not have permission to view this profile.",
    };
  }

  return { ok: true as const, profile };
}

export async function checkProfessionalApprovePermission() {
  try {
    await requirePermission(ADMIN_PERMISSIONS.PROFESSIONAL_APPROVE);
    return { ok: true as const, hasPermission: true };
  } catch {
    return { ok: true as const, hasPermission: false };
  }
}

export type PendingProfessional = {
  profile: typeof workerProfile.$inferSelect;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    role: string;
    status: string;
  };
};
