import type { PrismaClient } from "@prisma/client";
import { ApiError } from "./errors";
import { ensureInventoryAvailable } from "./outtake";

export type TransactionType = "intake" | "outtake";

export interface HistoryFilters {
  type?: "intake" | "outtake" | "all" | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
}

function parseDate(value: string, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError("INVALID_QUERY", 400, `${field} must be a valid date.`);
  }

  return date;
}

export function parseHistoryFilters(searchParams: URLSearchParams): HistoryFilters {
  const type = searchParams.get("type") ?? "all";
  if (type !== "all" && type !== "intake" && type !== "outtake") {
    throw new ApiError("INVALID_QUERY", 400, "type must be one of: all, intake, outtake.");
  }

  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  if (startDate) {
    parseDate(startDate, "startDate");
  }

  if (endDate) {
    parseDate(endDate, "endDate");
  }

  return {
    type,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };
}

function toDateFilter(filters: HistoryFilters): { gte?: Date; lte?: Date } | undefined {
  const startDate = filters.startDate;
  const endDate = filters.endDate;
  const hasStartDate = typeof startDate === "string";
  const hasEndDate = typeof endDate === "string";
  if (!hasStartDate && !hasEndDate) {
    return undefined;
  }

  const gte = hasStartDate ? parseDate(startDate, "startDate") : undefined;

  let lte: Date | undefined;
  if (hasEndDate) {
    lte = parseDate(endDate, "endDate");
    lte.setHours(23, 59, 59, 999);
  }

  return {
    ...(gte ? { gte } : {}),
    ...(lte ? { lte } : {}),
  };
}

export async function setTransactionLockState(
  client: PrismaClient,
  type: TransactionType,
  transactionId: string,
  locked: boolean,
) {
  const id = transactionId.trim();
  if (id.length === 0) {
    throw new ApiError("TRANSACTION_ID_REQUIRED", 400, "Transaction id is required.");
  }

  if (type === "intake") {
    const updated = await client.intakeTransaction.update({
      where: {
        id,
      },
      data: {
        saved: locked,
      },
    });

    return {
      id: updated.id,
      type,
      locked: updated.saved,
    };
  }

  if (type === "outtake") {
    if (locked) {
      await client.$transaction(async (tx) => {
        const transaction = await tx.outtakeTransaction.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!transaction) {
          throw new ApiError("TRANSACTION_NOT_FOUND", 404, "Transaction not found.");
        }

        const lineItems = transaction.items.map((item) => ({
          productId: item.productId,
          units: Number(item.units),
        }));

        await ensureInventoryAvailable(tx, lineItems);

        await tx.outtakeTransaction.update({
          where: { id },
          data: { saved: true },
        });
      });

      return {
        id,
        type,
        locked: true,
      };
    }

    const updated = await client.outtakeTransaction.update({
      where: {
        id,
      },
      data: {
        saved: locked,
      },
    });

    return {
      id: updated.id,
      type,
      locked: updated.saved,
    };
  }

  throw new ApiError(
    "INVALID_TRANSACTION_TYPE",
    400,
    "Transaction type must be intake or outtake.",
  );
}

export async function getTransactionHistory(client: PrismaClient, filters: HistoryFilters) {
  const dateFilter = toDateFilter(filters);
  const intakeWhere = dateFilter ? { date: dateFilter } : {};
  const outtakeWhere = dateFilter ? { date: dateFilter } : {};

  const intake =
    filters.type === "outtake"
      ? []
      : await client.intakeTransaction.findMany({
          where: intakeWhere,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

  const outtake =
    filters.type === "intake"
      ? []
      : await client.outtakeTransaction.findMany({
          where: outtakeWhere,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });

  const intakeRows = intake.map((transaction) => ({
    id: transaction.id,
    type: "intake" as const,
    date: transaction.date.toISOString(),
    locked: transaction.saved,
    notes: transaction.notes,
    lineItems: transaction.items.map((item) => ({
      productId: item.productId,
      productName: item.product.productName,
      productCategory: item.product.productCategory,
      lotNumber: item.product.lotNumber,
      units: Number(item.units),
    })),
  }));

  const outtakeRows = outtake.map((transaction) => ({
    id: transaction.id,
    type: "outtake" as const,
    date: transaction.date.toISOString(),
    locked: transaction.saved,
    customer: transaction.customer,
    notes: transaction.notes,
    lineItems: transaction.items.map((item) => ({
      productId: item.productId,
      productName: item.product.productName,
      productCategory: item.product.productCategory,
      lotNumber: item.product.lotNumber,
      units: Number(item.units),
    })),
  }));

  return [...intakeRows, ...outtakeRows].sort((left, right) => {
    const dateOrder = right.date.localeCompare(left.date);
    if (dateOrder !== 0) {
      return dateOrder;
    }

    return right.id.localeCompare(left.id);
  });
}
