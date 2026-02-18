import type { PrismaClient } from "@prisma/client";
import { toNumber } from "./number";

export interface InventorySnapshotRow {
  productId: string;
  productName: string;
  category: string;
  lot: string;
  unitsOnHand: number;
}

export interface InventoryFilters {
  productName?: string | undefined;
  category?: string | undefined;
  lot?: string | undefined;
  includeZero?: boolean | undefined;
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export async function getUnitsOnHandByProduct(
  client: PrismaClient | TransactionClient,
  productId: string,
  excludeOuttakeTransactionId?: string,
): Promise<number> {
  const [intake, outtake] = await Promise.all([
    client.intakeItem.aggregate({
      where: {
        productId,
        intakeTransaction: {
          saved: true,
        },
      },
      _sum: {
        units: true,
      },
    }),
    client.outtakeItem.aggregate({
      where: {
        productId,
        outtakeTransaction: {
          saved: true,
          ...(excludeOuttakeTransactionId ? { NOT: { id: excludeOuttakeTransactionId } } : {}),
        },
      },
      _sum: {
        units: true,
      },
    }),
  ]);

  return toNumber(intake._sum.units ?? 0) - toNumber(outtake._sum.units ?? 0);
}

export async function getInventorySnapshot(
  client: PrismaClient,
  filters: InventoryFilters = {},
): Promise<InventorySnapshotRow[]> {
  const products = await client.product.findMany({
    include: {
      intakeItems: {
        where: {
          intakeTransaction: {
            saved: true,
          },
        },
        select: {
          units: true,
        },
      },
      outtakeItems: {
        where: {
          outtakeTransaction: {
            saved: true,
          },
        },
        select: {
          units: true,
        },
      },
    },
  });

  const productFilter = normalize(filters.productName);
  const categoryFilter = normalize(filters.category);
  const lotFilter = normalize(filters.lot);
  const includeZero = filters.includeZero ?? false;

  const rows = products
    .map((product) => {
      const intakeUnits = product.intakeItems.reduce(
        (sum, intakeItem) => sum + toNumber(intakeItem.units),
        0,
      );
      const outtakeUnits = product.outtakeItems.reduce(
        (sum, outtakeItem) => sum + toNumber(outtakeItem.units),
        0,
      );

      return {
        productId: product.id,
        productName: product.productName,
        category: product.productCategory,
        lot: product.lotNumber,
        unitsOnHand: intakeUnits - outtakeUnits,
      } satisfies InventorySnapshotRow;
    })
    .filter((row) => {
      if (!includeZero && row.unitsOnHand <= 0) {
        return false;
      }

      const matchesProduct =
        productFilter.length === 0 || row.productName.toLowerCase().includes(productFilter);
      const matchesCategory =
        categoryFilter.length === 0 || row.category.toLowerCase().includes(categoryFilter);
      const matchesLot = lotFilter.length === 0 || row.lot.toLowerCase().includes(lotFilter);

      return matchesProduct && matchesCategory && matchesLot;
    })
    .sort((left, right) => {
      if (left.productName !== right.productName) {
        return left.productName.localeCompare(right.productName);
      }

      if (left.category !== right.category) {
        return left.category.localeCompare(right.category);
      }

      return left.lot.localeCompare(right.lot);
    });

  return rows;
}
