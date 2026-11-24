import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const ADMIN_PERMISSIONS = {
  PROFESSIONAL_APPROVE: "PROFESSIONAL_APPROVE",
  PROFESSIONAL_REJECT: "PROFESSIONAL_REJECT",
} as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

// SUPER_ADMIN has all permissions
// ADMIN can have specific permissions assigned
// For now, we'll give SUPER_ADMIN all permissions and ADMIN can be configured with specific ones
// This can be extended to a more granular permission system if needed

const SUPER_ADMIN_PERMISSIONS: Set<AdminPermission> = new Set(
  Object.values(ADMIN_PERMISSIONS)
);

const ADMIN_PERMISSIONS_SET: Set<AdminPermission> = new Set([
  ADMIN_PERMISSIONS.PROFESSIONAL_APPROVE,
  ADMIN_PERMISSIONS.PROFESSIONAL_REJECT,
]);

export async function hasPermission(permission: AdminPermission): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return false;

  const role = session.user.role;

  if (role === "SUPER_ADMIN") {
    return SUPER_ADMIN_PERMISSIONS.has(permission);
  }

  if (role === "ADMIN") {
    return ADMIN_PERMISSIONS_SET.has(permission);
  }

  return false;
}

export async function requirePermission(permission: AdminPermission): Promise<void> {
  const has = await hasPermission(permission);
  if (!has) {
    throw new Error(`Permission denied: ${permission}`);
  }
}
