import { failure, ok } from "../../../src/server/http";
import { services } from "../../../src/server/services";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const rows = await services.inventory.list(query);
    return ok({ rows });
  } catch (error) {
    return failure(error);
  }
}
