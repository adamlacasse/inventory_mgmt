import { ApiError } from "./errors";
import type { SessionUser } from "./session";

export const ROLES = ["viewer", "operator", "admin"] as const;
export type Role = (typeof ROLES)[number];

function roleLevel(role: string): number {
  const index = (ROLES as readonly string[]).indexOf(role);
  return index === -1 ? -1 : index;
}

export function requireRole(user: SessionUser, minRole: Role): void {
  if (roleLevel(user.role) < roleLevel(minRole)) {
    throw new ApiError("FORBIDDEN", 403, `This action requires the '${minRole}' role or higher.`);
  }
}
