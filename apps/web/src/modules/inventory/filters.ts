import type { InventoryFilters, InventoryRow } from "./types";

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function isLowStockRow(row: InventoryRow, threshold = DEFAULT_LOW_STOCK_THRESHOLD): boolean {
  return row.unitsOnHand <= threshold;
}

export function filterInventoryRows(
  rows: InventoryRow[],
  filters: InventoryFilters,
  threshold = DEFAULT_LOW_STOCK_THRESHOLD,
): InventoryRow[] {
  const normalizedProductName = normalize(filters.productName);
  const normalizedCategory = normalize(filters.category);
  const normalizedLot = normalize(filters.lot);

  return rows.filter((row) => {
    const matchesProductName =
      normalizedProductName.length === 0 ||
      normalize(row.productName).includes(normalizedProductName);
    const matchesCategory =
      normalizedCategory.length === 0 || normalize(row.category).includes(normalizedCategory);
    const matchesLot = normalizedLot.length === 0 || normalize(row.lot).includes(normalizedLot);
    const matchesLowStock = !filters.lowStockOnly || isLowStockRow(row, threshold);

    return matchesProductName && matchesCategory && matchesLot && matchesLowStock;
  });
}
