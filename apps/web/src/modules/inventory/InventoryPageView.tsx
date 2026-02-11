"use client";

import React, { useMemo, useState } from "react";
import { filterInventoryRows } from "./filters";
import type { InventoryFilters, InventoryRow } from "./types";

const defaultFilters: InventoryFilters = {
  productName: "",
  category: "",
  lot: "",
};

export interface InventoryPageViewProps {
  rows: InventoryRow[];
  initialFilters?: Partial<InventoryFilters>;
}

export function InventoryPageView({ rows, initialFilters }: InventoryPageViewProps) {
  const [filters, setFilters] = useState<InventoryFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  const visibleRows = useMemo(() => filterInventoryRows(rows, filters), [rows, filters]);
  const hasRows = rows.length > 0;

  return (
    <main>
      <h1>Current Inventory</h1>
      <p>Review units on hand and narrow by product attributes.</p>

      <section aria-label="Inventory filters">
        <label htmlFor="inventory-filter-product-name">
          Product Name
          <input
            id="inventory-filter-product-name"
            name="productName"
            type="text"
            value={filters.productName}
            onChange={(event) => {
              setFilters((previous) => ({
                ...previous,
                productName: event.target.value,
              }));
            }}
          />
        </label>
        <label htmlFor="inventory-filter-category">
          Category
          <input
            id="inventory-filter-category"
            name="category"
            type="text"
            value={filters.category}
            onChange={(event) => {
              setFilters((previous) => ({
                ...previous,
                category: event.target.value,
              }));
            }}
          />
        </label>
        <label htmlFor="inventory-filter-lot">
          Lot Number
          <input
            id="inventory-filter-lot"
            name="lot"
            type="text"
            value={filters.lot}
            onChange={(event) => {
              setFilters((previous) => ({
                ...previous,
                lot: event.target.value,
              }));
            }}
          />
        </label>
      </section>

      {!hasRows ? (
        <p>No inventory data is currently available.</p>
      ) : visibleRows.length === 0 ? (
        <p>No inventory rows match the current filters.</p>
      ) : (
        <table>
          <caption>Units on hand by product and lot</caption>
          <thead>
            <tr>
              <th scope="col">Product Name</th>
              <th scope="col">Category</th>
              <th scope="col">Lot</th>
              <th scope="col">Units On Hand</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={`${row.productName}-${row.category}-${row.lot}`}>
                <td>{row.productName}</td>
                <td>{row.category}</td>
                <td>{row.lot}</td>
                <td>{row.unitsOnHand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
