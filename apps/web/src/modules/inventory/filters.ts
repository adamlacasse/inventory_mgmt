import type { InventoryFilters, InventoryRow } from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function filterInventoryRows(
  rows: InventoryRow[],
  filters: InventoryFilters,
): InventoryRow[] {
  const normalizedProductName = normalize(filters.productName);
  const normalizedCategory = normalize(filters.category);
  const normalizedLot = normalize(filters.lot);

  return rows.filter((row) => {
    const matchesProductName =
      normalizedProductName.length === 0 ||
      normalize(row.productName).includes(normalizedProductName);
    const matchesCategory =
      normalizedCategory.length === 0 ||
      normalize(row.category).includes(normalizedCategory);
    const matchesLot = normalizedLot.length === 0 || normalize(row.lot).includes(normalizedLot);

    return matchesProductName && matchesCategory && matchesLot;
  });
}
