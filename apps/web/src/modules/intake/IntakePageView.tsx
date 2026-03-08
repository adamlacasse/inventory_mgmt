"use client";

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

const inputClass =
  "border border-charcoal/20 bg-white px-3 py-2 text-sm font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm w-full";
const labelClass =
  "flex flex-col gap-1 text-xs font-semibold tracking-widest uppercase text-charcoal/60";

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
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-wide text-charcoal m-0">Add Intake</h1>
        <p className="text-charcoal/60 mt-1 m-0">
          Record inbound inventory and lock the transaction on save.
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
      {loadingProducts ? (
        <p className="text-charcoal/50 text-sm italic">Loading products…</p>
      ) : null}

      <form onSubmit={submitIntake} className="flex flex-col gap-6">
        <div className="bg-white border border-charcoal/10 rounded-sm p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-charcoal/50 m-0 pb-2 border-b border-charcoal/8">
            Transaction Details
          </h2>
          <label className={labelClass} htmlFor="intake-date">
            Date
            <input
              id="intake-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className={labelClass} htmlFor="intake-notes">
            Notes
            <textarea
              id="intake-notes"
              value={notes}
              rows={3}
              onChange={(event) => setNotes(event.target.value)}
              className={`${inputClass} resize-y`}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3" aria-label="Intake line items">
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

              <label className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-charcoal/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lineItem.useInlineProduct}
                  onChange={(event) =>
                    updateLineItem(lineItem.id, { useInlineProduct: event.target.checked })
                  }
                  className="w-4 h-4 accent-charcoal cursor-pointer"
                />
                Create new product inline
              </label>

              {lineItem.useInlineProduct ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <label className={labelClass}>
                    Product Name
                    <input
                      value={lineItem.productName}
                      onChange={(event) =>
                        updateLineItem(lineItem.id, { productName: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Category
                    <input
                      value={lineItem.productCategory}
                      onChange={(event) =>
                        updateLineItem(lineItem.id, { productCategory: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Lot Number
                    <input
                      value={lineItem.lotNumber}
                      onChange={(event) =>
                        updateLineItem(lineItem.id, { lotNumber: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
              ) : (
                <label className={labelClass}>
                  Product
                  <select
                    value={lineItem.productId}
                    onChange={(event) =>
                      updateLineItem(lineItem.id, { productId: event.target.value })
                    }
                    className={inputClass}
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

              <label className={`${labelClass} max-w-32`}>
                Units
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={lineItem.units}
                  onChange={(event) => updateLineItem(lineItem.id, { units: event.target.value })}
                  className={inputClass}
                />
              </label>
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
            Save Intake (Lock)
          </button>
        </div>
      </form>
    </div>
  );
}
