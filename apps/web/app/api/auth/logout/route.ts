import { getSession } from "../../../../src/server/auth";
import { failure, ok } from "../../../../src/server/http";

export async function POST() {
  try {
    const session = await getSession();
    session.destroy();
    return ok({ success: true });
  } catch (error) {
    return failure(error);
  }
}
