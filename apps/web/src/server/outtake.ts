import type { PrismaClient } from "@prisma/client";
import { ApiError } from "./errors";
import { getUnitsOnHandByProduct } from "./inventory";

export interface OuttakeLineItemInput {
  productId: string;
  units: number;
}

export interface CreateOuttakeInput {
  date: string | Date;
  customer?: string | undefined;
  notes?: string | undefined;
  lineItems: OuttakeLineItemInput[];
  save?: boolean | undefined;
}

export interface UpdateOuttakeInput {
  date?: string | Date | undefined;
  customer?: string | null | undefined;
  notes?: string | null | undefined;
  lineItems?: OuttakeLineItemInput[] | undefined;
  save?: boolean | undefined;
}

function parsePayload(payload: unknown): Record<string, unknown> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new ApiError("INVALID_PAYLOAD", 400, "Payload must be an object.");
  }

  return payload as Record<string, unknown>;
}

function parseDate(value: unknown): Date {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new ApiError("INVALID_PAYLOAD", 400, "date must be a valid date.");
  }

  return date;
}

function parseOptionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiError("INVALID_PAYLOAD", 400, `${field} must be a string.`);
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function parseLineItem(value: unknown): OuttakeLineItemInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError("INVALID_PAYLOAD", 400, "lineItems must be an array of objects.");
  }

  const item = value as Record<string, unknown>;
  const productId = typeof item.productId === "string" ? item.productId.trim() : "";

  if (productId.length === 0) {
    throw new ApiError(
      "OUTTAKE_PRODUCT_REQUIRED",
      400,
      "Each outtake line item requires productId.",
    );
  }

  if (typeof item.units !== "number" || !Number.isFinite(item.units) || item.units <= 0) {
    throw new ApiError("OUTTAKE_UNITS_INVALID", 400, "Each outtake line item requires units > 0.");
  }

  return {
    productId,
    units: item.units,
  };
}

function parseLineItems(value: unknown): OuttakeLineItemInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError(
      "OUTTAKE_LINE_ITEMS_REQUIRED",
      400,
      "At least one outtake line item is required.",
    );
  }

  return value.map(parseLineItem);
}

function sumRequestedUnits(lineItems: OuttakeLineItemInput[]): Map<string, number> {
  return lineItems.reduce((unitsByProductId, lineItem) => {
    const current = unitsByProductId.get(lineItem.productId) ?? 0;
    unitsByProductId.set(lineItem.productId, current + lineItem.units);
    return unitsByProductId;
  }, new Map<string, number>());
}

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

async function ensureProductsExist(
  client: PrismaClient | TransactionClient,
  lineItems: OuttakeLineItemInput[],
) {
  const uniqueProductIds = [...new Set(lineItems.map((lineItem) => lineItem.productId))];
  const products = await client.product.findMany({
    where: {
      id: {
        in: uniqueProductIds,
      },
    },
    select: {
      id: true,
    },
  });

  const productIds = new Set(products.map((product) => product.id));
  const missing = uniqueProductIds.find((productId) => !productIds.has(productId));
  if (missing) {
    throw new ApiError("PRODUCT_NOT_FOUND", 404, `Product ${missing} not found.`);
  }
}

export async function ensureInventoryAvailable(
  client: PrismaClient | TransactionClient,
  lineItems: OuttakeLineItemInput[],
  excludeTransactionId?: string,
) {
  const requestedUnitsByProduct = sumRequestedUnits(lineItems);

  for (const [productId, requestedUnits] of requestedUnitsByProduct) {
    const unitsOnHand = await getUnitsOnHandByProduct(client, productId, excludeTransactionId);
    if (requestedUnits > unitsOnHand) {
      throw new ApiError(
        "OUTTAKE_INSUFFICIENT_INVENTORY",
        409,
        `Requested outtake units (${requestedUnits}) exceed units on hand (${unitsOnHand}) for product ${productId}.`,
      );
    }
  }
}

function ensureUnlocked(saved: boolean, id: string) {
  if (saved) {
    throw new ApiError(
      "TRANSACTION_LOCKED",
      409,
      `Transaction ${id} is locked and cannot be mutated until it is unlocked.`,
    );
  }
}

async function readOuttakeTransaction(
  client: PrismaClient | TransactionClient,
  outtakeTransactionId: string,
) {
  const transaction = await client.outtakeTransaction.findUnique({
    where: {
      id: outtakeTransactionId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new ApiError(
      "OUTTAKE_NOT_FOUND",
      404,
      `Outtake transaction ${outtakeTransactionId} not found.`,
    );
  }

  return {
    id: transaction.id,
    type: "outtake",
    date: transaction.date.toISOString(),
    customer: transaction.customer,
    notes: transaction.notes,
    locked: transaction.saved,
    lineItems: transaction.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.productName,
      productCategory: item.product.productCategory,
      lotNumber: item.product.lotNumber,
      units: Number(item.units),
    })),
  };
}

export function parseCreateOuttakeInput(payload: unknown): CreateOuttakeInput {
  const data = parsePayload(payload);

  return {
    date: parseDate(data.date),
    customer: parseOptionalString(data.customer, "customer"),
    notes: parseOptionalString(data.notes, "notes"),
    lineItems: parseLineItems(data.lineItems),
    save: typeof data.save === "boolean" ? data.save : true,
  };
}

export function parseUpdateOuttakeInput(payload: unknown): UpdateOuttakeInput {
  const data = parsePayload(payload);
  const input: UpdateOuttakeInput = {};

  if ("date" in data) {
    input.date = parseDate(data.date);
  }

  if ("customer" in data) {
    input.customer = parseOptionalString(data.customer, "customer") ?? null;
  }

  if ("notes" in data) {
    input.notes = parseOptionalString(data.notes, "notes") ?? null;
  }

  if ("lineItems" in data) {
    input.lineItems = parseLineItems(data.lineItems);
  }

  if ("save" in data) {
    if (typeof data.save !== "boolean") {
      throw new ApiError("INVALID_PAYLOAD", 400, "save must be a boolean.");
    }

    input.save = data.save;
  }

  if (Object.keys(input).length === 0) {
    throw new ApiError("INVALID_PAYLOAD", 400, "At least one outtake field must be updated.");
  }

  return input;
}

export async function createOuttakeTransaction(client: PrismaClient, input: CreateOuttakeInput) {
  return client.$transaction(async (tx) => {
    await ensureProductsExist(tx, input.lineItems);
    if (input.save ?? true) {
      await ensureInventoryAvailable(tx, input.lineItems);
    }

    const created = await tx.outtakeTransaction.create({
      data: {
        date: input.date,
        customer: input.customer ?? null,
        notes: input.notes ?? null,
        saved: input.save ?? true,
        items: {
          create: input.lineItems,
        },
      },
    });

    return readOuttakeTransaction(tx, created.id);
  });
}

export async function updateOuttakeTransaction(
  client: PrismaClient,
  outtakeTransactionId: string,
  input: UpdateOuttakeInput,
) {
  const id = outtakeTransactionId.trim();
  if (id.length === 0) {
    throw new ApiError("OUTTAKE_ID_REQUIRED", 400, "Outtake transaction id is required.");
  }

  const existing = await client.outtakeTransaction.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  if (!existing) {
    throw new ApiError("OUTTAKE_NOT_FOUND", 404, `Outtake transaction ${id} not found.`);
  }

  ensureUnlocked(existing.saved, existing.id);

  const nextLineItems = input.lineItems
    ? input.lineItems
    : existing.items.map((item) => ({
        productId: item.productId,
        units: Number(item.units),
      }));

  const nextSaved = input.save ?? existing.saved;

  await ensureProductsExist(client, nextLineItems);

  await client.$transaction(async (tx) => {
    if (nextSaved) {
      await ensureInventoryAvailable(tx, nextLineItems, id);
    }

    await tx.outtakeTransaction.update({
      where: {
        id,
      },
      data: {
        date: input.date ?? existing.date,
        customer: input.customer === undefined ? existing.customer : input.customer,
        notes: input.notes === undefined ? existing.notes : input.notes,
        saved: nextSaved,
      },
    });

    if (input.lineItems) {
      await tx.outtakeItem.deleteMany({
        where: {
          outtakeTransactionId: id,
        },
      });

      await tx.outtakeItem.createMany({
        data: nextLineItems.map((lineItem) => ({
          outtakeTransactionId: id,
          productId: lineItem.productId,
          units: lineItem.units,
        })),
      });
    }
  });

  return readOuttakeTransaction(client, id);
}
