import { requireSession } from "../../../../../src/server/auth";
import { ApiError } from "../../../../../src/server/errors";
import { failure, ok, parseJson } from "../../../../../src/server/http";
import { ROLES, requireRole } from "../../../../../src/server/roles";
import type { Role } from "../../../../../src/server/roles";
import { deactivateUser, updateUser } from "../../../../../src/server/users";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireSession();
    requireRole(actor, "admin");
    const { id } = await params;
    const payload = await parseJson(request);
    if (typeof payload !== "object" || payload === null) {
      throw new ApiError("INVALID_PAYLOAD", 400, "Invalid payload.");
    }
    const p = payload as Record<string, unknown>;
    if (typeof p.role === "string" && !(ROLES as readonly string[]).includes(p.role)) {
      throw new ApiError("INVALID_PAYLOAD", 400, `role must be one of: ${ROLES.join(", ")}.`);
    }
    const updated = await updateUser(id, {
      ...(typeof p.name === "string" && { name: p.name }),
      ...(typeof p.role === "string" && { role: p.role as Role }),
      ...(typeof p.password === "string" && { password: p.password }),
    });
    return ok({ user: updated });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireSession();
    requireRole(actor, "admin");
    const { id } = await params;
    const deactivated = await deactivateUser(id, actor.id);
    return ok({ user: deactivated });
  } catch (error) {
    return failure(error);
  }
}
