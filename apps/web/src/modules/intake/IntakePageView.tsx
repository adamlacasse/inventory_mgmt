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
      if (previous.length === 1) {
        return previous;
      }

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

        return {
          productId: lineItem.productId,
          units: Number(lineItem.units),
        };
      }),
      save: true,
    };

    const response = await fetch("/api/intake", {
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
      setError(body.error?.message ?? "Failed to create intake transaction.");
      return;
    }

    setStatusMessage(`Intake transaction ${body.transaction.id} saved and locked.`);
    setNotes("");
    setLineItems([createLineState(1)]);
  }

  return (
    <main>
      <h1>Add Intake</h1>
      <p>Record inbound inventory and lock the transaction on save.</p>

      {error ? <p role="alert">{error}</p> : null}
      {statusMessage ? <p>{statusMessage}</p> : null}
      {loadingProducts ? <p>Loading products...</p> : null}

      <form onSubmit={submitIntake}>
        <label htmlFor="intake-date">
          Date
          <input
            id="intake-date"
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
            }}
          />
        </label>

        <label htmlFor="intake-notes">
          Notes
          <textarea
            id="intake-notes"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
            }}
          />
        </label>

        <section aria-label="Intake line items">
          <h2>Line Items</h2>
          {lineItems.map((lineItem) => (
            <article key={lineItem.id}>
              <label>
                <input
                  type="checkbox"
                  checked={lineItem.useInlineProduct}
                  onChange={(event) => {
                    updateLineItem(lineItem.id, {
                      useInlineProduct: event.target.checked,
                    });
                  }}
                />
                Create new product inline
              </label>

              {lineItem.useInlineProduct ? (
                <>
                  <label>
                    Product Name
                    <input
                      value={lineItem.productName}
                      onChange={(event) => {
                        updateLineItem(lineItem.id, {
                          productName: event.target.value,
                        });
                      }}
                    />
                  </label>
                  <label>
                    Category
                    <input
                      value={lineItem.productCategory}
                      onChange={(event) => {
                        updateLineItem(lineItem.id, {
                          productCategory: event.target.value,
                        });
                      }}
                    />
                  </label>
                  <label>
                    Lot Number
                    <input
                      value={lineItem.lotNumber}
                      onChange={(event) => {
                        updateLineItem(lineItem.id, {
                          lotNumber: event.target.value,
                        });
                      }}
                    />
                  </label>
                </>
              ) : (
                <label>
                  Product
                  <select
                    value={lineItem.productId}
                    onChange={(event) => {
                      updateLineItem(lineItem.id, {
                        productId: event.target.value,
                      });
                    }}
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.productName} | {product.productCategory} | {product.lotNumber}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label>
                Units
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={lineItem.units}
                  onChange={(event) => {
                    updateLineItem(lineItem.id, {
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
        <button type="submit">Save Intake (Lock)</button>
      </form>
    </main>
  );
}
