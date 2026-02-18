import type { PrismaClient } from "@prisma/client";
import { ApiError } from "./errors";
import { ensureProductExists } from "./products";

export interface IntakeLineItemInput {
  productId?: string;
  productName?: string;
  productCategory?: string;
  lotNumber?: string;
  units: number;
}

export interface CreateIntakeInput {
  date: string | Date;
  notes?: string | undefined;
  lineItems: IntakeLineItemInput[];
  save?: boolean | undefined;
}

export interface UpdateIntakeInput {
  date?: string | Date | undefined;
  notes?: string | null | undefined;
  lineItems?: IntakeLineItemInput[] | undefined;
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

function parseNotes(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new ApiError("INVALID_PAYLOAD", 400, "notes must be a string.");
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function parseUnits(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new ApiError("INVALID_PAYLOAD", 400, "units must be a positive number.");
  }

  return value;
}

function parseLineItem(value: unknown): IntakeLineItemInput {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ApiError("INVALID_PAYLOAD", 400, "lineItems must be an array of objects.");
  }

  const item = value as Record<string, unknown>;
  const productId = typeof item.productId === "string" ? item.productId.trim() : "";

  if (productId.length > 0) {
    return {
      productId,
      units: parseUnits(item.units),
    };
  }

  if (
    typeof item.productName !== "string" ||
    item.productName.trim().length === 0 ||
    typeof item.productCategory !== "string" ||
    item.productCategory.trim().length === 0 ||
    typeof item.lotNumber !== "string" ||
    item.lotNumber.trim().length === 0
  ) {
    throw new ApiError(
      "INTAKE_PRODUCT_REQUIRED",
      400,
      "Each intake line item requires productId or productName/productCategory/lotNumber.",
    );
  }

  return {
    productName: item.productName.trim(),
    productCategory: item.productCategory.trim(),
    lotNumber: item.lotNumber.trim(),
    units: parseUnits(item.units),
  };
}

function parseLineItems(value: unknown): IntakeLineItemInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ApiError(
      "INTAKE_LINE_ITEMS_REQUIRED",
      400,
      "At least one intake line item is required.",
    );
  }

  return value.map(parseLineItem);
}

export function parseCreateIntakeInput(payload: unknown): CreateIntakeInput {
  const data = parsePayload(payload);

  return {
    date: parseDate(data.date),
    notes: parseNotes(data.notes),
    lineItems: parseLineItems(data.lineItems),
    save: typeof data.save === "boolean" ? data.save : true,
  };
}

export function parseUpdateIntakeInput(payload: unknown): UpdateIntakeInput {
  const data = parsePayload(payload);
  const input: UpdateIntakeInput = {};

  if ("date" in data) {
    input.date = parseDate(data.date);
  }

  if ("notes" in data) {
    input.notes = parseNotes(data.notes) ?? null;
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
    throw new ApiError("INVALID_PAYLOAD", 400, "At least one intake field must be updated.");
  }

  return input;
}

async function resolveLineItemProducts(client: PrismaClient, lineItems: IntakeLineItemInput[]) {
  return Promise.all(
    lineItems.map(async (lineItem) => {
      if (lineItem.productId) {
        const product = await client.product.findUnique({
          where: {
            id: lineItem.productId,
          },
        });

        if (!product) {
          throw new ApiError("PRODUCT_NOT_FOUND", 404, `Product ${lineItem.productId} not found.`);
        }

        return {
          productId: product.id,
          units: lineItem.units,
        };
      }

      const product = await ensureProductExists(client, {
        productName: lineItem.productName ?? "",
        productCategory: lineItem.productCategory ?? "",
        lotNumber: lineItem.lotNumber ?? "",
      });

      return {
        productId: product.id,
        units: lineItem.units,
      };
    }),
  );
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

async function readIntakeTransaction(client: PrismaClient, intakeTransactionId: string) {
  const transaction = await client.intakeTransaction.findUnique({
    where: {
      id: intakeTransactionId,
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
      "INTAKE_NOT_FOUND",
      404,
      `Intake transaction ${intakeTransactionId} not found.`,
    );
  }

  return {
    id: transaction.id,
    type: "intake",
    date: transaction.date.toISOString(),
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

export async function createIntakeTransaction(client: PrismaClient, input: CreateIntakeInput) {
  const lineItems = await resolveLineItemProducts(client, input.lineItems);

  const created = await client.intakeTransaction.create({
    data: {
      date: input.date,
      notes: input.notes ?? null,
      saved: input.save ?? true,
      items: {
        create: lineItems,
      },
    },
  });

  return readIntakeTransaction(client, created.id);
}

export async function updateIntakeTransaction(
  client: PrismaClient,
  intakeTransactionId: string,
  input: UpdateIntakeInput,
) {
  const id = intakeTransactionId.trim();
  if (id.length === 0) {
    throw new ApiError("INTAKE_ID_REQUIRED", 400, "Intake transaction id is required.");
  }

  const existing = await client.intakeTransaction.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  if (!existing) {
    throw new ApiError("INTAKE_NOT_FOUND", 404, `Intake transaction ${id} not found.`);
  }

  ensureUnlocked(existing.saved, existing.id);

  const nextLineItems = input.lineItems
    ? await resolveLineItemProducts(client, input.lineItems)
    : existing.items.map((item) => ({
        productId: item.productId,
        units: Number(item.units),
      }));

  if (nextLineItems.length === 0) {
    throw new ApiError(
      "INTAKE_LINE_ITEMS_REQUIRED",
      400,
      "At least one intake line item is required.",
    );
  }

  await client.$transaction(async (tx) => {
    await tx.intakeTransaction.update({
      where: {
        id,
      },
      data: {
        date: input.date ?? existing.date,
        notes: input.notes === undefined ? existing.notes : input.notes,
        saved: input.save ?? existing.saved,
      },
    });

    if (input.lineItems) {
      await tx.intakeItem.deleteMany({
        where: {
          intakeTransactionId: id,
        },
      });

      await tx.intakeItem.createMany({
        data: nextLineItems.map((lineItem) => ({
          intakeTransactionId: id,
          productId: lineItem.productId,
          units: lineItem.units,
        })),
      });
    }
  });

  return readIntakeTransaction(client, id);
}
