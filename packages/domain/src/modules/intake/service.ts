import { randomUUID } from "node:crypto";
import { ZodIssueCode } from "zod";
import type { IntakeRepository } from "./repo";
import {
  type CreateIntakeDraftTransactionInput,
  type IntakeDraftTransaction,
  createIntakeDraftTransactionInputSchema,
} from "./schema";

export type IntakeValidationErrorCode =
  | "INTAKE_LINE_ITEMS_REQUIRED"
  | "INTAKE_PRODUCT_ID_REQUIRED"
  | "INTAKE_UNITS_MUST_BE_POSITIVE"
  | "INTAKE_INVALID_PAYLOAD";

export class IntakeValidationError extends Error {
  readonly code: IntakeValidationErrorCode;

  constructor(code: IntakeValidationErrorCode, message: string) {
    super(message);
    this.name = "IntakeValidationError";
    this.code = code;
  }
}

export interface IntakeService {
  createDraftTransaction(input: CreateIntakeDraftTransactionInput): Promise<IntakeDraftTransaction>;
}

function mapIntakeValidationError(input: unknown): IntakeValidationError {
  const parsed = createIntakeDraftTransactionInputSchema.safeParse(input);
  if (parsed.success) {
    return new IntakeValidationError("INTAKE_INVALID_PAYLOAD", "Invalid intake payload.");
  }

  const firstIssue = parsed.error.issues[0];
  if (!firstIssue) {
    return new IntakeValidationError("INTAKE_INVALID_PAYLOAD", "Invalid intake payload.");
  }

  if (
    firstIssue.code === ZodIssueCode.too_small &&
    firstIssue.path.length === 1 &&
    firstIssue.path[0] === "lineItems"
  ) {
    return new IntakeValidationError(
      "INTAKE_LINE_ITEMS_REQUIRED",
      "Intake transaction requires at least one line item.",
    );
  }

  if (
    firstIssue.code === ZodIssueCode.too_small &&
    firstIssue.path.length === 3 &&
    firstIssue.path[0] === "lineItems" &&
    firstIssue.path[2] === "productId"
  ) {
    return new IntakeValidationError(
      "INTAKE_PRODUCT_ID_REQUIRED",
      "Each intake line item requires a productId.",
    );
  }

  if (
    firstIssue.code === ZodIssueCode.too_small &&
    firstIssue.path.length === 3 &&
    firstIssue.path[0] === "lineItems" &&
    firstIssue.path[2] === "units"
  ) {
    return new IntakeValidationError(
      "INTAKE_UNITS_MUST_BE_POSITIVE",
      "Each intake line item requires units greater than zero.",
    );
  }

  return new IntakeValidationError("INTAKE_INVALID_PAYLOAD", "Invalid intake payload.");
}

function validateInput(
  input: CreateIntakeDraftTransactionInput,
): CreateIntakeDraftTransactionInput {
  const parsed = createIntakeDraftTransactionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw mapIntakeValidationError(input);
  }

  return parsed.data;
}

function toDraftTransaction(input: CreateIntakeDraftTransactionInput): IntakeDraftTransaction {
  return {
    id: randomUUID(),
    type: "intake",
    status: "draft",
    date: input.date,
    ...(input.notes ? { notes: input.notes } : {}),
    lineItems: input.lineItems,
  };
}

export function createIntakeService(repository: IntakeRepository): IntakeService {
  return {
    async createDraftTransaction(input) {
      const validInput = validateInput(input);
      const draftTransaction = toDraftTransaction(validInput);

      await repository.save(draftTransaction);
      return draftTransaction;
    },
  };
}
