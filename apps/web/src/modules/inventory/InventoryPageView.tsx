"use client";

import React, { useMemo, useState } from "react";
import { DEFAULT_LOW_STOCK_THRESHOLD, filterInventoryRows, isLowStockRow } from "./filters";
import type { InventoryFilters, InventoryRow } from "./types";

const defaultFilters: InventoryFilters = {
  productName: "",
  category: "",
  lot: "",
  lowStockOnly: false,
};

export interface InventoryPageViewProps {
  rows: InventoryRow[];
  initialFilters?: Partial<InventoryFilters>;
  lowStockThreshold?: number;
}

export function InventoryPageView({
  rows,
  initialFilters,
  lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD,
}: InventoryPageViewProps) {
  const [filters, setFilters] = useState<InventoryFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  const visibleRows = useMemo(
    () => filterInventoryRows(rows, filters, lowStockThreshold),
    [filters, lowStockThreshold, rows],
  );
  const lowStockRows = useMemo(
    () => rows.filter((row) => isLowStockRow(row, lowStockThreshold)),
    [lowStockThreshold, rows],
  );
  const hasRows = rows.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wide text-charcoal m-0">Current Inventory</h1>
        <p className="text-charcoal/60 mt-1 m-0">
          Review units on hand and narrow by product attributes.
        </p>
      </div>

      {lowStockRows.length > 0 ? (
        <div
          className="flex items-start gap-3 px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded-sm"
          aria-label="Low stock alerts"
        >
          <span className="text-red-600 font-bold text-lg leading-none mt-0.5">⚠</span>
          <p className="text-red-700 text-sm m-0">
            <strong>{lowStockRows.length}</strong> lot{lowStockRows.length === 1 ? "" : "s"} at or
            below {lowStockThreshold} units.
          </p>
        </div>
      ) : (
        <div
          className="flex items-start gap-3 px-4 py-3 bg-green-50 border-l-4 border-green-600 rounded-sm"
          aria-label="Low stock alerts"
        >
          <span className="text-green-600 font-bold text-lg leading-none mt-0.5">✓</span>
          <p className="text-green-700 text-sm m-0">All lots are above the low-stock threshold.</p>
        </div>
      )}

      <div
        className="bg-white border border-charcoal/10 rounded-sm p-4 flex flex-wrap gap-4 items-end"
        aria-label="Inventory filters"
      >
        <label
          className="flex flex-col gap-1 text-xs font-semibold tracking-widest uppercase text-charcoal/60 flex-1 min-w-36"
          htmlFor="inventory-filter-product-name"
        >
          Product Name
          <input
            id="inventory-filter-product-name"
            name="productName"
            type="text"
            value={filters.productName}
            onChange={(event) => {
              setFilters((previous) => ({ ...previous, productName: event.target.value }));
            }}
            className="border border-charcoal/20 bg-white px-3 py-2 text-sm font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm"
          />
        </label>

        <label
          className="flex flex-col gap-1 text-xs font-semibold tracking-widest uppercase text-charcoal/60 flex-1 min-w-36"
          htmlFor="inventory-filter-category"
        >
          Category
          <input
            id="inventory-filter-category"
            name="category"
            type="text"
            value={filters.category}
            onChange={(event) => {
              setFilters((previous) => ({ ...previous, category: event.target.value }));
            }}
            className="border border-charcoal/20 bg-white px-3 py-2 text-sm font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm"
          />
        </label>

        <label
          className="flex flex-col gap-1 text-xs font-semibold tracking-widest uppercase text-charcoal/60 flex-1 min-w-36"
          htmlFor="inventory-filter-lot"
        >
          Lot Number
          <input
            id="inventory-filter-lot"
            name="lot"
            type="text"
            value={filters.lot}
            onChange={(event) => {
              setFilters((previous) => ({ ...previous, lot: event.target.value }));
            }}
            className="border border-charcoal/20 bg-white px-3 py-2 text-sm font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm"
          />
        </label>

        <label
          className="flex flex-row items-center gap-2 text-xs font-semibold tracking-widest uppercase text-charcoal/60 pb-2 cursor-pointer"
          htmlFor="inventory-filter-low-stock-only"
        >
          <input
            id="inventory-filter-low-stock-only"
            name="lowStockOnly"
            type="checkbox"
            checked={filters.lowStockOnly}
            onChange={(event) => {
              setFilters((previous) => ({ ...previous, lowStockOnly: event.target.checked }));
            }}
            className="w-4 h-4 accent-charcoal cursor-pointer"
          />
          Low stock only
        </label>
      </div>

      {!hasRows ? (
        <p className="text-charcoal/50 italic">No inventory data is currently available.</p>
      ) : visibleRows.length === 0 ? (
        <p className="text-charcoal/50 italic">No rows match the current filters.</p>
      ) : (
        <div className="bg-white border border-charcoal/10 rounded-sm overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <caption className="sr-only">Units on hand by product and lot</caption>
            <thead>
              <tr className="bg-charcoal text-white/80">
                {["Product Name", "Category", "Lot", "Units On Hand", "Status"].map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={[
                      "px-4 py-3 text-xs font-semibold tracking-widest uppercase",
                      i === 3 ? "text-right" : "text-left",
                    ].join(" ")}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => {
                const lowStock = isLowStockRow(row, lowStockThreshold);
                return (
                  <tr
                    key={`${row.productName}-${row.category}-${row.lot}`}
                    className={[
                      "border-t border-charcoal/8 transition-colors",
                      lowStock
                        ? "bg-red-50/60"
                        : index % 2 === 0
                          ? "bg-white"
                          : "bg-charcoal/[0.02]",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3 text-charcoal font-medium">{row.productName}</td>
                    <td className="px-4 py-3 text-charcoal/70">{row.category}</td>
                    <td className="px-4 py-3 text-charcoal/60 font-mono text-xs">{row.lot}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {row.unitsOnHand}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-block px-2.5 py-0.5 text-xs font-semibold tracking-widest uppercase rounded-sm",
                          lowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700",
                        ].join(" ")}
                      >
                        {lowStock ? "Low stock" : "Healthy"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
