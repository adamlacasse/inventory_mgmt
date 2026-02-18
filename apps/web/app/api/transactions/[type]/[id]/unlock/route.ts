import { ApiError } from "../../../../../../src/server/errors";
import { failure, ok } from "../../../../../../src/server/http";
import { services } from "../../../../../../src/server/services";

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

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const params = await context.params;
    const type = getRouteParam(params, "type");
    const id = getRouteParam(params, "id");
    if (!type || !id) {
      throw new ApiError("INVALID_ROUTE_PARAMS", 400, "Route params type and id are required.");
    }
    if (type !== "intake" && type !== "outtake") {
      throw new ApiError(
        "INVALID_TRANSACTION_TYPE",
        400,
        "Transaction type must be intake or outtake.",
      );
    }

    const transaction = await services.transactions.unlock(type, id);
    return ok({ transaction });
  } catch (error) {
    return failure(error);
  }
}
