import { describe, expect, it } from "vitest";
import { filterInventoryRows } from "./filters";
import type { InventoryRow } from "./types";

const rows: InventoryRow[] = [
  { productName: "Blue Dream", category: "Flower", lot: "LOT-100", unitsOnHand: 20 },
  { productName: "Blueberry Kush", category: "Flower", lot: "LOT-200", unitsOnHand: 5 },
  { productName: "Mint Cart", category: "Vape", lot: "LOT-300", unitsOnHand: 41 },
];

describe("filterInventoryRows", () => {
  it("returns all rows when filters are empty", () => {
    const filteredRows = filterInventoryRows(rows, {
      productName: "",
      category: "",
      lot: "",
      lowStockOnly: false,
    });

    expect(filteredRows).toEqual(rows);
  });

  it("combines product name, category, and lot filters deterministically", () => {
    const filteredRows = filterInventoryRows(rows, {
      productName: "blue",
      category: "flower",
      lot: "200",
      lowStockOnly: false,
    });

    expect(filteredRows).toEqual([
      { productName: "Blueberry Kush", category: "Flower", lot: "LOT-200", unitsOnHand: 5 },
    ]);
  });

  it("can restrict results to low-stock rows only", () => {
    const filteredRows = filterInventoryRows(rows, {
      productName: "",
      category: "",
      lot: "",
      lowStockOnly: true,
    });

    expect(filteredRows).toEqual([
      { productName: "Blueberry Kush", category: "Flower", lot: "LOT-200", unitsOnHand: 5 },
    ]);
  });
});
