import type { PrismaClient } from "@prisma/client";
import { type InventoryFilters, getInventorySnapshot } from "./inventory";

function csvEscape(value: string | number): string {
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

export async function exportInventoryCsv(client: PrismaClient, filters: InventoryFilters = {}) {
  const rows = await getInventorySnapshot(client, filters);
  const header = ["Product Name", "Category", "Lot", "Units On Hand"];
  const body = rows.map((row) => [row.productName, row.category, row.lot, row.unitsOnHand]);

  return [header, ...body].map((line) => line.map(csvEscape).join(",")).join("\n");
}
