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
    <main className="inventory-page">
      <h1>Current Inventory</h1>
      <p>Review units on hand and narrow by product attributes.</p>

      {lowStockRows.length > 0 ? (
        <section className="inventory-alert" aria-label="Low stock alerts">
          <p>
            {lowStockRows.length} lot{lowStockRows.length === 1 ? "" : "s"} at or below{" "}
            {lowStockThreshold} units.
          </p>
        </section>
      ) : (
        <section className="inventory-alert inventory-alert--clear" aria-label="Low stock alerts">
          <p>No low-stock lots right now.</p>
        </section>
      )}

      <section className="inventory-filters" aria-label="Inventory filters">
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
        <label htmlFor="inventory-filter-low-stock-only" className="inventory-filters__checkbox">
          <input
            id="inventory-filter-low-stock-only"
            name="lowStockOnly"
            type="checkbox"
            checked={filters.lowStockOnly}
            onChange={(event) => {
              setFilters((previous) => ({
                ...previous,
                lowStockOnly: event.target.checked,
              }));
            }}
          />
          Low stock only
        </label>
      </section>

      {!hasRows ? (
        <p>No inventory data is currently available.</p>
      ) : visibleRows.length === 0 ? (
        <p>No inventory rows match the current filters.</p>
      ) : (
        <table className="inventory-table">
          <caption>Units on hand by product and lot</caption>
          <thead>
            <tr>
              <th scope="col">Product Name</th>
              <th scope="col">Category</th>
              <th scope="col">Lot</th>
              <th scope="col">Units On Hand</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const lowStock = isLowStockRow(row, lowStockThreshold);

              return (
                <tr
                  key={`${row.productName}-${row.category}-${row.lot}`}
                  className={
                    lowStock ? "inventory-table__row inventory-table__row--low" : undefined
                  }
                >
                  <td>{row.productName}</td>
                  <td>{row.category}</td>
                  <td>{row.lot}</td>
                  <td>{row.unitsOnHand}</td>
                  <td>
                    <span
                      className={
                        lowStock
                          ? "inventory-status-badge inventory-status-badge--low"
                          : "inventory-status-badge inventory-status-badge--healthy"
                      }
                    >
                      {lowStock ? "Low stock" : "Healthy"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
