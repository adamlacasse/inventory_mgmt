import { failure, ok, parseJson } from "../../../src/server/http";
import { services } from "../../../src/server/services";

export async function POST(request: Request) {
  try {
    const payload = await parseJson(request);
    const transaction = await services.outtake.create(payload);
    return ok({ transaction }, 201);
  } catch (error) {
    return failure(error);
  }
}
