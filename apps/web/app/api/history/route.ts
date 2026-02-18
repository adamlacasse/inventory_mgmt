import { failure, ok } from "../../../src/server/http";
import { services } from "../../../src/server/services";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const transactions = await services.history.list(query);
    return ok({ transactions });
  } catch (error) {
    return failure(error);
  }
}
