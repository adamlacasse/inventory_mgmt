import { requireSession } from "../../../src/server/auth";
import { failure, ok } from "../../../src/server/http";
import { requireRole } from "../../../src/server/roles";
import { services } from "../../../src/server/services";

export async function GET(request: Request) {
  try {
    const user = await requireSession();
    requireRole(user, "viewer");
    const query = new URL(request.url).searchParams;
    const transactions = await services.history.list(query);
    return ok({ transactions });
  } catch (error) {
    return failure(error);
  }
}
