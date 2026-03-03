import bcrypt from "bcryptjs";
import { getSession } from "../../../../src/server/auth";
import { ApiError } from "../../../../src/server/errors";
import { failure, ok, parseJson } from "../../../../src/server/http";
import { prisma } from "../../../../src/server/prisma";

export async function POST(request: Request) {
  try {
    const payload = await parseJson(request);

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof (payload as Record<string, unknown>).email !== "string" ||
      typeof (payload as Record<string, unknown>).password !== "string"
    ) {
      throw new ApiError("INVALID_PAYLOAD", 400, "Email and password are required.");
    }

    const { email, password } = payload as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });

    // Generic error message — do not distinguish "user not found" from "wrong password"
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError("INVALID_CREDENTIALS", 401, "Invalid email or password.");
    }

    const session = await getSession();
    session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    await session.save();

    return ok({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    return failure(error);
  }
}
