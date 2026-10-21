import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { initialLocations, serviceLocation } from "@/lib/db/location-schema";

export async function POST() {
  const email = (process.env.ADMIN_EMAIL_2 ?? process.env.ADMIN_EMAIL)
    ?.trim()
    .toLowerCase();
  const password = (
    process.env.ADMIN_PASSWORD_2 ?? process.env.ADMIN_PASSWORD
  )?.trim();
  const name = process.env.ADMIN_NAME_2?.trim() || "Sajjad Hussain";
  if (!email || !password)
    return NextResponse.json(
      { error: "Admin bootstrap is not configured." },
      { status: 503 },
    );

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  if (existing[0])
    return NextResponse.json(
      { error: "Admin bootstrap has already been completed." },
      { status: 409 },
    );

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });
  if (!result.user?.id)
    return NextResponse.json(
      { error: "Admin bootstrap failed." },
      { status: 500 },
    );
  await db
    .update(user)
    .set({ role: "ADMIN", status: "ACTIVE", emailVerified: true })
    .where(eq(user.id, result.user.id));

  // Seed initial locations
  const existingLocations = await db
    .select({ id: serviceLocation.id })
    .from(serviceLocation)
    .limit(1);
  if (!existingLocations[0]) {
    await db.insert(serviceLocation).values(initialLocations as any);
  }

  return NextResponse.json({ ok: true });
}
