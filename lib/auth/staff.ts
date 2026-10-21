import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const staffRoles = ["STAFF", "ADMIN", "SUPER_ADMIN"];

export async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || !staffRoles.includes(session.user.role ?? ""))
    throw new Error("Unauthorized");
  return session.user;
}
