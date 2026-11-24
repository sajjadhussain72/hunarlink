import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const staffRoles = ["STAFF", "ADMIN", "SUPER_ADMIN"];
const professionalRole = "PROFESSIONAL";

export async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !staffRoles.includes(session.user.role ?? ""))
    throw new Error("Unauthorized");
  return session.user;
}

export async function requireProfessional() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    throw new Error("Unauthorized: Professional access required");

  // Check if user has PROFESSIONAL role (already approved)
  const hasRole = session.user.role === professionalRole;
  
  // If not PROFESSIONAL role, check for pending workerProfile
  if (!hasRole) {
    const [workerProf] = await db
      .select()
      .from(workerProfile)
      .where(eq(workerProfile.userId, session.user.id))
      .limit(1);

    // Only allow access if profile exists and is PENDING (not REJECTED)
    if (!workerProf || workerProf.verificationStatus === "REJECTED") {
      throw new Error("Unauthorized: Professional access required");
    }
  }

  return session.user;
}
