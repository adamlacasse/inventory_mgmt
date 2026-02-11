import { describe, expect, it } from "vitest";
import { filterInventoryRows } from "./filters";
import type { InventoryRow } from "./types";

const rows: InventoryRow[] = [
  { productName: "Blue Dream", category: "Flower", lot: "LOT-100", unitsOnHand: 20 },
  { productName: "Blueberry Kush", category: "Flower", lot: "LOT-200", unitsOnHand: 17 },
  { productName: "Mint Cart", category: "Vape", lot: "LOT-300", unitsOnHand: 41 },
];

describe("filterInventoryRows", () => {
  it("returns all rows when filters are empty", () => {
    const filteredRows = filterInventoryRows(rows, {
      productName: "",
      category: "",
      lot: "",
    });

    expect(filteredRows).toEqual(rows);
  });

  it("combines product name, category, and lot filters deterministically", () => {
    const filteredRows = filterInventoryRows(rows, {
      productName: "blue",
      category: "flower",
      lot: "200",
    });

    expect(filteredRows).toEqual([
      { productName: "Blueberry Kush", category: "Flower", lot: "LOT-200", unitsOnHand: 17 },
    ]);
  });
});
