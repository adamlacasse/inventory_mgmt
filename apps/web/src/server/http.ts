import { NextResponse } from "next/server";
import { ApiError, asApiError } from "./errors";

export function ok<T>(data: T, status = 200): Response {
  return NextResponse.json(data, { status });
}

export function failure(error: unknown): Response {
  const apiError = asApiError(error);
  return NextResponse.json(
    {
      error: {
        code: apiError.code,
        message: apiError.message,
      },
    },
    { status: apiError.status },
  );
}

export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError("INVALID_JSON", 400, "Request body must be valid JSON.");
  }
}
