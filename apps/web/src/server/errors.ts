export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function asApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
    return new ApiError("NOT_FOUND", 404, "Requested record was not found.");
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
    return new ApiError("CONFLICT", 409, "Record conflicts with an existing unique value.");
  }

  return new ApiError("INTERNAL_ERROR", 500, "Unexpected server error.");
}
