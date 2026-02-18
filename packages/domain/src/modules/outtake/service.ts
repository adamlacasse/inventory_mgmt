import { randomUUID } from "node:crypto";
import { ZodIssueCode } from "zod";
import type { InventoryRepository } from "../inventory/repo";
import { canOuttake } from "../inventory/service";
import type { OuttakeRepository } from "./repo";
import {
  type CreateOuttakeDraftTransactionInput,
  type OuttakeDraftTransaction,
  type OuttakeLine,
  createOuttakeDraftTransactionInputSchema,
} from "./schema";

export type OuttakeValidationErrorCode =
  | "OUTTAKE_LINE_ITEMS_REQUIRED"
  | "OUTTAKE_PRODUCT_ID_REQUIRED"
  | "OUTTAKE_UNITS_MUST_BE_POSITIVE"
  | "OUTTAKE_INSUFFICIENT_INVENTORY"
  | "OUTTAKE_INVALID_PAYLOAD";

export class OuttakeValidationError extends Error {
  readonly code: OuttakeValidationErrorCode;

  constructor(code: OuttakeValidationErrorCode, message: string) {
    super(message);
    this.name = "OuttakeValidationError";
    this.code = code;
  }
}

export interface OuttakeService {
  createDraftTransaction(
    input: CreateOuttakeDraftTransactionInput,
  ): Promise<OuttakeDraftTransaction>;
}

function mapOuttakeValidationError(input: unknown): OuttakeValidationError {
  const parsed = createOuttakeDraftTransactionInputSchema.safeParse(input);
  if (parsed.success) {
    return new OuttakeValidationError("OUTTAKE_INVALID_PAYLOAD", "Invalid outtake payload.");
  }

  const firstIssue = parsed.error.issues[0];
  if (!firstIssue) {
    return new OuttakeValidationError("OUTTAKE_INVALID_PAYLOAD", "Invalid outtake payload.");
  }

  if (
    firstIssue.code === ZodIssueCode.too_small &&
    firstIssue.path.length === 1 &&
    firstIssue.path[0] === "lineItems"
  ) {
    return new OuttakeValidationError(
      "OUTTAKE_LINE_ITEMS_REQUIRED",
      "Outtake transaction requires at least one line item.",
    );
  }

  if (
    firstIssue.code === ZodIssueCode.too_small &&
    firstIssue.path.length === 3 &&
    firstIssue.path[0] === "lineItems" &&
    firstIssue.path[2] === "productId"
  ) {
    return new OuttakeValidationError(
      "OUTTAKE_PRODUCT_ID_REQUIRED",
      "Each outtake line item requires a productId.",
    );
  }

  if (
    firstIssue.code === ZodIssueCode.too_small &&
    firstIssue.path.length === 3 &&
    firstIssue.path[0] === "lineItems" &&
    firstIssue.path[2] === "units"
  ) {
    return new OuttakeValidationError(
      "OUTTAKE_UNITS_MUST_BE_POSITIVE",
      "Each outtake line item requires units greater than zero.",
    );
  }

  return new OuttakeValidationError("OUTTAKE_INVALID_PAYLOAD", "Invalid outtake payload.");
}

function validateInput(
  input: CreateOuttakeDraftTransactionInput,
): CreateOuttakeDraftTransactionInput {
  const parsed = createOuttakeDraftTransactionInputSchema.safeParse(input);
  if (!parsed.success) {
    throw mapOuttakeValidationError(input);
  }

  return parsed.data;
}

function sumUnitsByProduct(lineItems: OuttakeLine[]): Map<string, number> {
  return lineItems.reduce((sumsByProduct, lineItem) => {
    const current = sumsByProduct.get(lineItem.productId) ?? 0;
    sumsByProduct.set(lineItem.productId, current + lineItem.units);
    return sumsByProduct;
  }, new Map<string, number>());
}

async function ensureInventoryAvailable(
  lineItems: OuttakeLine[],
  inventoryRepository: InventoryRepository,
): Promise<void> {
  const requestedUnitsByProduct = sumUnitsByProduct(lineItems);

  for (const [productId, requestedUnits] of requestedUnitsByProduct) {
    const unitsOnHand = await inventoryRepository.getUnitsOnHandByProduct(productId);
    if (!canOuttake(unitsOnHand, requestedUnits)) {
      throw new OuttakeValidationError(
        "OUTTAKE_INSUFFICIENT_INVENTORY",
        `Requested outtake units (${requestedUnits}) exceed units on hand (${unitsOnHand}) for product ${productId}.`,
      );
    }
  }
}

function toDraftTransaction(input: CreateOuttakeDraftTransactionInput): OuttakeDraftTransaction {
  return {
    id: randomUUID(),
    type: "outtake",
    status: "draft",
    date: input.date,
    ...(input.notes ? { notes: input.notes } : {}),
    lineItems: input.lineItems,
  };
}

export function createOuttakeService(
  repository: OuttakeRepository,
  inventoryRepository: InventoryRepository,
): OuttakeService {
  return {
    async createDraftTransaction(input) {
      const validInput = validateInput(input);
      await ensureInventoryAvailable(validInput.lineItems, inventoryRepository);
      const draftTransaction = toDraftTransaction(validInput);

      await repository.save(draftTransaction);
      return draftTransaction;
    },
  };
}
