import { failure, ok, parseJson } from "../../../../src/server/http";
import { services } from "../../../../src/server/services";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const params = await context.params;
    const payload = await parseJson(request);
    const transaction = await services.intake.update(params.id, payload);
    return ok({ transaction });
  } catch (error) {
    return failure(error);
  }
}
