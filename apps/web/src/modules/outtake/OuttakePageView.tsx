"use client";

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
  return {
    id: `line-${seed}`,
    productId: "",
    units: "1",
  };
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
      if (previous.length === 1) {
        return previous;
      }

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
      headers: {
        "Content-Type": "application/json",
      },
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
    <main>
      <h1>Add Outtake</h1>
      <p>Record sales/depletion from available inventory only.</p>

      {error ? <p role="alert">{error}</p> : null}
      {statusMessage ? <p>{statusMessage}</p> : null}

      <form onSubmit={submitOuttake}>
        <label htmlFor="outtake-date">
          Date
          <input
            id="outtake-date"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
            }}
          />
        </label>

        <label htmlFor="outtake-customer">
          Customer (optional)
          <input
            id="outtake-customer"
            value={customer}
            onChange={(event) => {
              setCustomer(event.target.value);
            }}
          />
        </label>

        <label htmlFor="outtake-notes">
          Notes
          <textarea
            id="outtake-notes"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
            }}
          />
        </label>

        <section aria-label="Outtake line items">
          <h2>Line Items</h2>
          {lineItems.map((lineItem) => (
            <article key={lineItem.id}>
              <label>
                Product
                <select
                  value={lineItem.productId}
                  onChange={(event) => {
                    updateLine(lineItem.id, {
                      productId: event.target.value,
                    });
                  }}
                >
                  <option value="">Select available inventory</option>
                  {inventoryRows.map((row) => (
                    <option key={row.productId} value={row.productId}>
                      {row.productName} | {row.category} | {row.lot} | {row.unitsOnHand} on hand
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Units
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={lineItem.units}
                  onChange={(event) => {
                    updateLine(lineItem.id, {
                      units: event.target.value,
                    });
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  removeLine(lineItem.id);
                }}
              >
                Remove Line
              </button>
            </article>
          ))}
        </section>

        <button type="button" onClick={addLine}>
          Add Line Item
        </button>
        <button type="submit">Save Outtake (Lock)</button>
      </form>
    </main>
  );
}
