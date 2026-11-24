"use server";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { booking, jobRequest, user } from "@/lib/db/schema";
import { requireProfessional } from "@/lib/auth/staff";

const updateBookingStatusSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"]),
});

export async function getProfessionalBookings() {
  const professional = await requireProfessional();

  const bookings = await db
    .select({
      booking: booking,
      jobRequest: {
        id: jobRequest.id,
        title: jobRequest.title,
        description: jobRequest.description,
        location: jobRequest.location,
        preferredDate: jobRequest.preferredDate,
        preferredTime: jobRequest.preferredTime,
        budgetMin: jobRequest.budgetMin,
        budgetMax: jobRequest.budgetMax,
      },
      customer: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    })
    .from(booking)
    .innerJoin(jobRequest, eq(jobRequest.id, booking.jobRequestId))
    .innerJoin(user, eq(user.id, booking.customerId))
    .where(eq(booking.workerId, professional.id))
    .orderBy(desc(booking.createdAt));

  return { ok: true as const, bookings };
}

export async function updateBookingStatus(input: z.infer<typeof updateBookingStatusSchema>) {
  const parsed = updateBookingStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: "Invalid input data.",
    };
  }

  const professional = await requireProfessional();

  const { bookingId, status } = parsed.data;

  // Verify the booking belongs to this professional
  const [existingBooking] = await db
    .select()
    .from(booking)
    .where(
      and(
        eq(booking.id, bookingId),
        eq(booking.workerId, professional.id)
      )
    )
    .limit(1);

  if (!existingBooking) {
    return {
      ok: false as const,
      message: "Booking not found or you do not have permission to update it.",
    };
  }

  await db
    .update(booking)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  return {
    ok: true as const,
    message: "Booking status updated successfully.",
  };
}

export async function getProfessionalDashboardStats() {
  const professional = await requireProfessional();

  const bookings = await db
    .select({ status: booking.status })
    .from(booking)
    .where(eq(booking.workerId, professional.id));

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "ASSIGNED").length,
    inProgress: bookings.filter((b) => b.status === "IN_PROGRESS").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
  };

  return { ok: true as const, stats };
}
