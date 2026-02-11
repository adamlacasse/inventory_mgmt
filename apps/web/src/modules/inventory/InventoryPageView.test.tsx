import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { InventoryPageView } from "./InventoryPageView";
import type { InventoryRow } from "./types";

const rows: InventoryRow[] = [
  { productName: "Blue Dream", category: "Flower", lot: "LOT-100", unitsOnHand: 20 },
  { productName: "Mint Cart", category: "Vape", lot: "LOT-300", unitsOnHand: 41 },
];

describe("InventoryPageView", () => {
  it("renders inventory table for populated data", () => {
    const html = renderToStaticMarkup(<InventoryPageView rows={rows} />);

    expect(html).toContain("Current Inventory");
    expect(html).toContain("<table>");
    expect(html).toContain("Blue Dream");
    expect(html).toContain("LOT-100");
    expect(html).toContain("Units On Hand");
  });

  it("renders no-data empty state when there are no rows", () => {
    const html = renderToStaticMarkup(<InventoryPageView rows={[]} />);

    expect(html).toContain("No inventory data is currently available.");
    expect(html).not.toContain("<table>");
  });

  it("renders no-match empty state when filters match nothing", () => {
    const html = renderToStaticMarkup(
      <InventoryPageView
        rows={rows}
        initialFilters={{ productName: "not-a-match", category: "", lot: "" }}
      />,
    );

    expect(html).toContain("No inventory rows match the current filters.");
    expect(html).not.toContain("<table>");
  });
});
