import { requireSession } from "../../../src/server/auth";
import { failure, ok, parseJson } from "../../../src/server/http";
import { requireRole } from "../../../src/server/roles";
import { services } from "../../../src/server/services";

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    requireRole(user, "operator");
    const payload = (await parseJson(request)) as Record<string, unknown>;
    const transaction = await services.intake.create({
      ...payload,
      actorUserId: user.id,
    });
    return ok({ transaction }, 201);
  } catch (error) {
    return failure(error);
  }
}
