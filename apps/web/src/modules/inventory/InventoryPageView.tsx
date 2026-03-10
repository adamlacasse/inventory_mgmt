"use client";

import { EmptyState, FilterToolbar, StatusBanner } from "@inventory/ui";
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
    <div className="page-stack">
      <div>
        <h1 className="page-title">Current Inventory</h1>
        <p className="page-subtitle">Review units on hand and narrow by product attributes.</p>
      </div>

      {lowStockRows.length > 0 ? (
        <StatusBanner variant="error">
          {lowStockRows.length} lot{lowStockRows.length === 1 ? "" : "s"} at or below{" "}
          {lowStockThreshold} units.
        </StatusBanner>
      ) : (
        <StatusBanner variant="success">All lots are above the low-stock threshold.</StatusBanner>
      )}

      <div className="filter-table-group">
      <FilterToolbar aria-label="Inventory filters">
        <div className="filter-field">
          <label className="form-label" htmlFor="inventory-filter-product-name">
            Product Name
            <input
              id="inventory-filter-product-name"
              name="productName"
              type="text"
              value={filters.productName}
              onChange={(event) => {
                setFilters((previous) => ({ ...previous, productName: event.target.value }));
              }}
              className="form-input"
            />
          </label>
        </div>

        <div className="filter-field">
          <label className="form-label" htmlFor="inventory-filter-category">
            Category
            <input
              id="inventory-filter-category"
              name="category"
              type="text"
              value={filters.category}
              onChange={(event) => {
                setFilters((previous) => ({ ...previous, category: event.target.value }));
              }}
              className="form-input"
            />
          </label>
        </div>

        <div className="filter-field">
          <label className="form-label" htmlFor="inventory-filter-lot">
            Lot Number
            <input
              id="inventory-filter-lot"
              name="lot"
              type="text"
              value={filters.lot}
              onChange={(event) => {
                setFilters((previous) => ({ ...previous, lot: event.target.value }));
              }}
              className="form-input"
            />
          </label>
        </div>

        <label className="form-label-inline" htmlFor="inventory-filter-low-stock-only">
          <input
            id="inventory-filter-low-stock-only"
            name="lowStockOnly"
            type="checkbox"
            checked={filters.lowStockOnly}
            onChange={(event) => {
              setFilters((previous) => ({ ...previous, lowStockOnly: event.target.checked }));
            }}
            className="form-checkbox"
          />
          Low stock only
        </label>
      </FilterToolbar>

      {!hasRows ? (
        <EmptyState>No inventory data is currently available.</EmptyState>
      ) : visibleRows.length === 0 ? (
        <EmptyState>No rows match the current filters.</EmptyState>
      ) : (
        <div className="section-card">
          <table className="data-table">
            <caption className="sr-only">Units on hand by product and lot</caption>
            <thead>
              <tr>
                {["Product Name", "Category", "Lot", "Units On Hand", "Status"].map((h, i) => (
                  <th key={h} scope="col" className={i === 3 ? "col-right" : ""}>
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
                    className={
                      lowStock ? "row-low-stock" : index % 2 === 0 ? "row-even" : "row-odd"
                    }
                  >
                    <td style={{ fontWeight: 500 }}>{row.productName}</td>
                    <td style={{ color: "rgba(28,37,44,0.7)" }}>{row.category}</td>
                    <td className="col-mono" style={{ color: "rgba(28,37,44,0.6)" }}>
                      {row.lot}
                    </td>
                    <td className="col-right" style={{ fontWeight: 600 }}>
                      {row.unitsOnHand}
                    </td>
                    <td>
                      <span className={`badge ${lowStock ? "badge-low-stock" : "badge-healthy"}`}>
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
    </div>
  );
}
