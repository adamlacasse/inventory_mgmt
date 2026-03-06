import { requireSession } from "../../../../src/server/auth";
import { ApiError } from "../../../../src/server/errors";
import { failure, ok, parseJson } from "../../../../src/server/http";
import { ROLES, type Role, requireRole } from "../../../../src/server/roles";
import { createUser, listUsers } from "../../../../src/server/users";

export async function GET() {
  try {
    const user = await requireSession();
    requireRole(user, "admin");
    const users = await listUsers();
    return ok({ users });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    requireRole(user, "admin");
    const payload = await parseJson(request);
    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof (payload as Record<string, unknown>).email !== "string" ||
      typeof (payload as Record<string, unknown>).name !== "string" ||
      typeof (payload as Record<string, unknown>).password !== "string"
    ) {
      throw new ApiError("INVALID_PAYLOAD", 400, "email, name, and password are required.");
    }
    const { email, name, password } = payload as { email: string; name: string; password: string };
    const role = ((payload as Record<string, unknown>).role as Role) ?? "operator";
    if (!(ROLES as readonly string[]).includes(role)) {
      throw new ApiError("INVALID_PAYLOAD", 400, `role must be one of: ${ROLES.join(", ")}.`);
    }
    const newUser = await createUser({ email, name, password, role });
    return ok({ user: newUser }, 201);
  } catch (error) {
    return failure(error);
  }
}
