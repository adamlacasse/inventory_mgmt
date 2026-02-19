import { ApiError } from "../../../../src/server/errors";
import { failure, ok, parseJson } from "../../../../src/server/http";
import { services } from "../../../../src/server/services";

type RouteContext = {
  params: Promise<Record<string, string | string[] | undefined>>;
};

function getRouteParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const id = getRouteParam(params, "id");
    if (!id) {
      throw new ApiError("INVALID_ROUTE_PARAMS", 400, "Route param id is required.");
    }
    const payload = await parseJson(request);
    const transaction = await services.outtake.update(id, payload);
    return ok({ transaction });
  } catch (error) {
    return failure(error);
  }
}
