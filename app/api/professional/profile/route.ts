import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "You must be authenticated to submit a profile." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const profession = formData.get("profession") as string;
    const bio = formData.get("bio") as string;
    const experienceYears = parseInt(formData.get("experienceYears") as string);
    const hourlyRate = formData.get("hourlyRate")
      ? parseInt(formData.get("hourlyRate") as string)
      : null;
    const minimumCharge = formData.get("minimumCharge")
      ? parseInt(formData.get("minimumCharge") as string)
      : null;

    if (!profession || !bio || isNaN(experienceYears)) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const [existingProfile] = await db
      .select()
      .from(workerProfile)
      .where(eq(workerProfile.userId, session.user.id))
      .limit(1);

    if (existingProfile) {
      return NextResponse.json(
        { message: "You have already submitted a professional profile." },
        { status: 400 }
      );
    }

    // Create worker profile
    await db.insert(workerProfile).values({
      userId: session.user.id,
      profession,
      bio,
      experienceYears,
      hourlyRate,
      minimumCharge,
      verificationStatus: "PENDING",
      availabilityStatus: "OFFLINE",
    });

    return NextResponse.json(
      { message: "Profile submitted successfully." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { message: "An error occurred while submitting your profile." },
      { status: 500 }
    );
  }
}
