"use client";

import { SectionCard, StatusBanner } from "@inventory/ui";
import React, { type FormEvent, useEffect, useState } from "react";

interface InventoryRow {
  productId: string;
  productName: string;
  category: string;
  lot: string;
  unitsOnHand: number;
}

interface OuttakeLineState {
  id: string;
  productId: string;
  units: string;
}

function createLineState(seed: number): OuttakeLineState {
  return { id: `line-${seed}`, productId: "", units: "1" };
}

export function OuttakePageView() {
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<OuttakeLineState[]>([createLineState(1)]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInventory() {
      try {
        const response = await fetch("/api/inventory", { cache: "no-store" });
        const payload = (await response.json()) as {
          rows?: InventoryRow[];
          error?: { message: string };
        };
        if (!response.ok || !payload.rows) {
          throw new Error(payload.error?.message ?? "Failed to load available inventory.");
        }
        setInventoryRows(payload.rows);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load available inventory.",
        );
      }
    }
    void loadInventory();
  }, []);

  function updateLine(lineId: string, update: Partial<OuttakeLineState>) {
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

  async function submitOuttake(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatusMessage(null);

    const payload = {
      date,
      customer,
      notes,
      lineItems: lineItems.map((lineItem) => ({
        productId: lineItem.productId,
        units: Number(lineItem.units),
      })),
      save: true,
    };

    const response = await fetch("/api/outtake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as {
      transaction?: { id: string };
      error?: { message: string };
    };

    if (!response.ok || !body.transaction) {
      setError(body.error?.message ?? "Failed to create outtake transaction.");
      return;
    }

    setStatusMessage(`Outtake transaction ${body.transaction.id} saved and locked.`);
    setCustomer("");
    setNotes("");
    setLineItems([createLineState(1)]);
  }

  return (
    <div className="page-stack" style={{ maxWidth: "48rem" }}>
      <div>
        <h1 className="page-title">Add Outtake</h1>
        <p className="page-subtitle">Record sales and depletions from available inventory only.</p>
      </div>

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}
      {statusMessage ? <StatusBanner variant="success">{statusMessage}</StatusBanner> : null}

      <form onSubmit={submitOuttake} className="page-stack">
        <SectionCard>
          <h2 className="section-card-header">Transaction Details</h2>
          <div className="section-card-body form-stack">
            <div className="grid-2">
              <label className="form-label" htmlFor="outtake-date">
                Date
                <input
                  id="outtake-date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="form-input"
                />
              </label>
              <label className="form-label" htmlFor="outtake-customer">
                Customer (optional)
                <input
                  id="outtake-customer"
                  value={customer}
                  onChange={(event) => setCustomer(event.target.value)}
                  className="form-input"
                />
              </label>
            </div>
            <label className="form-label" htmlFor="outtake-notes">
              Notes
              <textarea
                id="outtake-notes"
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
          aria-label="Outtake line items"
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

                <div className="grid-3">
                  <label className="form-label" style={{ gridColumn: "1 / span 2" }}>
                    Product / Lot
                    <select
                      value={lineItem.productId}
                      onChange={(event) =>
                        updateLine(lineItem.id, { productId: event.target.value })
                      }
                      className="form-input"
                    >
                      <option value="">Select available inventory…</option>
                      {inventoryRows.map((row) => (
                        <option key={row.productId} value={row.productId}>
                          {row.productName} | {row.category} | {row.lot} | {row.unitsOnHand} on hand
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-label">
                    Units
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={lineItem.units}
                      onChange={(event) => updateLine(lineItem.id, { units: event.target.value })}
                      className="form-input"
                    />
                  </label>
                </div>
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
            Save Outtake (Lock)
          </button>
        </div>
      </form>
    </div>
  );
}
