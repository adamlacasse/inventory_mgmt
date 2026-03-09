"use client";

import { SectionCard, StatusBanner } from "@inventory/ui";
import React, { type FormEvent, useEffect, useState } from "react";
import type { ProductRecord } from "../products/types";

interface IntakeLineState {
  id: string;
  productId: string;
  useInlineProduct: boolean;
  productName: string;
  productCategory: string;
  lotNumber: string;
  units: string;
}

function createLineState(seed: number): IntakeLineState {
  return {
    id: `line-${seed}`,
    productId: "",
    useInlineProduct: false,
    productName: "",
    productCategory: "",
    lotNumber: "",
    units: "1",
  };
}

export function IntakePageView() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<IntakeLineState[]>([createLineState(1)]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const payload = (await response.json()) as {
          products?: ProductRecord[];
          error?: { message: string };
        };
        if (!response.ok || !payload.products) {
          throw new Error(payload.error?.message ?? "Failed to load products.");
        }
        setProducts(payload.products);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    }
    void loadProducts();
  }, []);

  function updateLineItem(lineId: string, update: Partial<IntakeLineState>) {
    setLineItems((previous) =>
      previous.map((lineItem) => (lineItem.id === lineId ? { ...lineItem, ...update } : lineItem)),
    );
  }

  function addLine() {
    setLineItems((previous) => [...previous, createLineState(previous.length + 1)]);
  }

  function removeLine(lineId: string) {
    setLineItems((previous) => {
      if (previous.length === 1) return previous;
      return previous.filter((lineItem) => lineItem.id !== lineId);
    });
  }

  async function submitIntake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatusMessage(null);

    const payload = {
      date,
      notes,
      lineItems: lineItems.map((lineItem) => {
        if (lineItem.useInlineProduct) {
          return {
            productName: lineItem.productName,
            productCategory: lineItem.productCategory,
            lotNumber: lineItem.lotNumber,
            units: Number(lineItem.units),
          };
        }
        return { productId: lineItem.productId, units: Number(lineItem.units) };
      }),
      save: true,
    };

    const response = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as {
      transaction?: { id: string };
      error?: { message: string };
    };

    if (!response.ok || !body.transaction) {
      setError(body.error?.message ?? "Failed to create intake transaction.");
      return;
    }

    setStatusMessage(`Intake transaction ${body.transaction.id} saved and locked.`);
    setNotes("");
    setLineItems([createLineState(1)]);
  }

  return (
    <div className="page-stack" style={{ maxWidth: "48rem" }}>
      <div>
        <h1 className="page-title">Add Intake</h1>
        <p className="page-subtitle">Record inbound inventory and lock the transaction on save.</p>
      </div>

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}
      {statusMessage ? <StatusBanner variant="success">{statusMessage}</StatusBanner> : null}
      {loadingProducts ? (
        <p style={{ color: "rgba(28,37,44,0.5)", fontSize: "0.875rem", fontStyle: "italic" }}>
          Loading products…
        </p>
      ) : null}

      <form onSubmit={submitIntake} className="page-stack">
        <SectionCard>
          <h2 className="section-card-header">Transaction Details</h2>
          <div className="section-card-body form-stack">
            <label className="form-label" htmlFor="intake-date">
              Date
              <input
                id="intake-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="form-input"
              />
            </label>
            <label className="form-label" htmlFor="intake-notes">
              Notes
              <textarea
                id="intake-notes"
                value={notes}
                rows={3}
                onChange={(event) => setNotes(event.target.value)}
                className="form-input"
                style={{ resize: "vertical" }}
              />
            </label>
          </div>
        </SectionCard>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          aria-label="Intake line items"
        >
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(28,37,44,0.5)",
              margin: 0,
            }}
          >
            Line Items
          </h2>

          {lineItems.map((lineItem, idx) => (
            <SectionCard key={lineItem.id}>
              <div className="section-card-body form-stack">
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(28,37,44,0.4)",
                    }}
                  >
                    Line {idx + 1}
                  </span>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(lineItem.id)}
                      className="btn-remove-line"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label className="form-label-inline">
                  <input
                    type="checkbox"
                    checked={lineItem.useInlineProduct}
                    onChange={(event) =>
                      updateLineItem(lineItem.id, { useInlineProduct: event.target.checked })
                    }
                    className="form-checkbox"
                  />
                  Create new product inline
                </label>

                {lineItem.useInlineProduct ? (
                  <div className="grid-3">
                    <label className="form-label">
                      Product Name
                      <input
                        value={lineItem.productName}
                        onChange={(event) =>
                          updateLineItem(lineItem.id, { productName: event.target.value })
                        }
                        className="form-input"
                      />
                    </label>
                    <label className="form-label">
                      Category
                      <input
                        value={lineItem.productCategory}
                        onChange={(event) =>
                          updateLineItem(lineItem.id, { productCategory: event.target.value })
                        }
                        className="form-input"
                      />
                    </label>
                    <label className="form-label">
                      Lot Number
                      <input
                        value={lineItem.lotNumber}
                        onChange={(event) =>
                          updateLineItem(lineItem.id, { lotNumber: event.target.value })
                        }
                        className="form-input"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="form-label">
                    Product
                    <select
                      value={lineItem.productId}
                      onChange={(event) =>
                        updateLineItem(lineItem.id, { productId: event.target.value })
                      }
                      className="form-input"
                    >
                      <option value="">Select product…</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.productName} | {product.productCategory} | {product.lotNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="form-label" style={{ maxWidth: "8rem" }}>
                  Units
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={lineItem.units}
                    onChange={(event) => updateLineItem(lineItem.id, { units: event.target.value })}
                    className="form-input"
                  />
                </label>
              </div>
            </SectionCard>
          ))}

          <button
            type="button"
            onClick={addLine}
            className="btn-add-line"
            style={{ alignSelf: "flex-start" }}
          >
            + Add Line Item
          </button>
        </div>

        <div className="actions-end">
          <button type="submit" className="btn-brand">
            Save Intake (Lock)
          </button>
        </div>
      </form>
    </div>
  );
}
