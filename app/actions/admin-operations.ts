"use server";

import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import {
  serviceCategory,
  serviceRequest,
  serviceStatusHistory,
} from "@/lib/db/managed-schema";

async function staffUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const [record] = await db
    .select({ id: user.id, name: user.name, role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);
  return record && ["STAFF", "ADMIN", "SUPER_ADMIN"].includes(record.role)
    ? record
    : null;
}

export async function getAdminRequests() {
  const staff = await staffUser();
  if (!staff) return { ok: false as const, message: "Staff access required." };
  const rows = await db
    .select({
      request: serviceRequest,
      category: serviceCategory,
      customerName: user.name,
      customerEmail: user.email,
    })
    .from(serviceRequest)
    .innerJoin(
      serviceCategory,
      eq(serviceCategory.id, serviceRequest.categoryId),
    )
    .innerJoin(user, eq(user.id, serviceRequest.customerId))
    .orderBy(desc(serviceRequest.createdAt));
  return { ok: true as const, rows };
}

export async function updateRequestStatus(input: {
  requestId: string;
  status: string;
  note?: string;
}) {
  const staff = await staffUser();
  if (!staff) return { ok: false as const, message: "Staff access required." };
  if (
    !input.requestId ||
    ![
      "REQUESTED",
      "UNDER_REVIEW",
      "ASSIGNING",
      "ASSIGNED",
      "CONFIRMED",
      "PROFESSIONAL_ON_THE_WAY",
      "SERVICE_STARTED",
      "SERVICE_COMPLETED",
      "CUSTOMER_CONFIRMED",
      "CLOSED",
      "CANCELLED",
      "RESCHEDULED",
      "DISPUTED",
      "REQUIRES_FOLLOW_UP",
    ].includes(input.status)
  )
    return { ok: false as const, message: "Invalid request update." };
  const [current] = await db
    .select({ status: serviceRequest.status })
    .from(serviceRequest)
    .where(eq(serviceRequest.id, input.requestId))
    .limit(1);
  if (!current) return { ok: false as const, message: "Request not found." };
  await db
    .update(serviceRequest)
    .set({ status: input.status, updatedAt: new Date() })
    .where(eq(serviceRequest.id, input.requestId));
  await db
    .insert(serviceStatusHistory)
    .values({
      serviceRequestId: input.requestId,
      previousStatus: current.status,
      newStatus: input.status,
      changedBy: staff.id,
      note: input.note || "Updated by HunarLink operations",
    });
  return { ok: true as const };
}

export type AdminRequestRows = Awaited<ReturnType<typeof getAdminRequests>>;
