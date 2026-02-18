import { ApiError } from "../../../../../../src/server/errors";
import { failure, ok } from "../../../../../../src/server/http";
import { services } from "../../../../../../src/server/services";

export async function POST(
  _request: Request,
  context: { params: Promise<{ type: string; id: string }> | { type: string; id: string } },
) {
  try {
    const params = await context.params;
    if (params.type !== "intake" && params.type !== "outtake") {
      throw new ApiError(
        "INVALID_TRANSACTION_TYPE",
        400,
        "Transaction type must be intake or outtake.",
      );
    }

    const transaction = await services.transactions.lock(params.type, params.id);
    return ok({ transaction });
  } catch (error) {
    return failure(error);
  }
}
