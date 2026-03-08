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
  return { id: `line-${seed}`, productId: "", units: "1" };
}

const inputClass =
  "border border-charcoal/20 bg-white px-3 py-2 text-sm font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm w-full";
const labelClass =
  "flex flex-col gap-1 text-xs font-semibold tracking-widest uppercase text-charcoal/60";

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
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-wide text-charcoal m-0">Add Outtake</h1>
        <p className="text-charcoal/60 mt-1 m-0">
          Record sales and depletions from available inventory only.
        </p>
      </div>

      {error ? (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-sm">
          {error}
        </div>
      ) : null}
      {statusMessage ? (
        <div className="px-4 py-3 bg-green-50 border-l-4 border-green-600 text-green-700 text-sm rounded-sm">
          {statusMessage}
        </div>
      ) : null}

      <form onSubmit={submitOuttake} className="flex flex-col gap-6">
        <div className="bg-white border border-charcoal/10 rounded-sm p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-charcoal/50 m-0 pb-2 border-b border-charcoal/8">
            Transaction Details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelClass} htmlFor="outtake-date">
              Date
              <input
                id="outtake-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass} htmlFor="outtake-customer">
              Customer (optional)
              <input
                id="outtake-customer"
                value={customer}
                onChange={(event) => setCustomer(event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className={labelClass} htmlFor="outtake-notes">
            Notes
            <textarea
              id="outtake-notes"
              value={notes}
              rows={3}
              onChange={(event) => setNotes(event.target.value)}
              className={`${inputClass} resize-y`}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3" aria-label="Outtake line items">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-charcoal/50 m-0">
            Line Items
          </h2>

          {lineItems.map((lineItem, idx) => (
            <div
              key={lineItem.id}
              className="bg-white border border-charcoal/10 rounded-sm p-5 flex flex-col gap-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-widest uppercase text-charcoal/40">
                  Line {idx + 1}
                </span>
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(lineItem.id)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors cursor-pointer bg-transparent border-0 p-0 font-serif"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className={`${labelClass} sm:col-span-2`}>
                  Product / Lot
                  <select
                    value={lineItem.productId}
                    onChange={(event) => updateLine(lineItem.id, { productId: event.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select available inventory…</option>
                    {inventoryRows.map((row) => (
                      <option key={row.productId} value={row.productId}>
                        {row.productName} | {row.category} | {row.lot} | {row.unitsOnHand} on hand
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  Units
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={lineItem.units}
                    onChange={(event) => updateLine(lineItem.id, { units: event.target.value })}
                    className={inputClass}
                  />
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLine}
            className="self-start text-sm text-charcoal/60 hover:text-charcoal border border-dashed border-charcoal/30 hover:border-charcoal/60 px-4 py-2 rounded-sm transition-colors cursor-pointer bg-transparent font-serif"
          >
            + Add Line Item
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-charcoal text-amber font-bold tracking-widest uppercase text-sm py-3 px-8 hover:bg-amber hover:text-charcoal transition-colors cursor-pointer rounded-sm shadow-sm"
          >
            Save Outtake (Lock)
          </button>
        </div>
      </form>
    </div>
  );
}
