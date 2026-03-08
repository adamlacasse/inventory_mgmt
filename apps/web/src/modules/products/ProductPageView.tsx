"use client";

import React, { type FormEvent, useCallback, useEffect, useState } from "react";
import type { ProductRecord } from "./types";

const initialCreateForm = { productName: "", productCategory: "", lotNumber: "" };

const inputClass =
  "border border-charcoal/20 bg-white px-3 py-2 text-sm font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm w-full";
const labelClass =
  "flex flex-col gap-1 text-xs font-semibold tracking-widest uppercase text-charcoal/60";

export function ProductPageView() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(initialCreateForm);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function onCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const payload = (await response.json()) as { error?: { message: string } };
    if (!response.ok) {
      setError(payload.error?.message ?? "Failed to create product.");
      return;
    }
    setCreateForm(initialCreateForm);
    setMessage("Product created.");
    await loadProducts();
  }

  function beginEditing(product: ProductRecord) {
    setEditingProductId(product.id);
    setEditForm({
      productName: product.productName,
      productCategory: product.productCategory,
      lotNumber: product.lotNumber,
    });
  }

  async function onSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProductId) return;
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/products/${editingProductId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const payload = (await response.json()) as { error?: { message: string } };
    if (!response.ok) {
      setError(payload.error?.message ?? "Failed to update product.");
      return;
    }
    setEditingProductId(null);
    setEditForm(initialCreateForm);
    setMessage("Product updated.");
    await loadProducts();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wide text-charcoal m-0">Product Master</h1>
        <p className="text-charcoal/60 mt-1 m-0">
          Create and maintain products by name, category, and lot.
        </p>
      </div>

      {error ? (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-sm">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="px-4 py-3 bg-green-50 border-l-4 border-green-600 text-green-700 text-sm rounded-sm">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div
            className="bg-white border border-charcoal/10 rounded-sm p-5 shadow-sm"
            aria-label="Create product"
          >
            <h2 className="text-xs font-semibold tracking-widest uppercase text-charcoal/50 m-0 mb-4 pb-2 border-b border-charcoal/8">
              Add Product
            </h2>
            <form onSubmit={onCreateProduct} className="flex flex-col gap-3">
              <label className={labelClass} htmlFor="create-product-name">
                Product Name
                <input
                  id="create-product-name"
                  value={createForm.productName}
                  onChange={(event) =>
                    setCreateForm((previous) => ({
                      ...previous,
                      productName: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass} htmlFor="create-product-category">
                Category
                <input
                  id="create-product-category"
                  value={createForm.productCategory}
                  onChange={(event) =>
                    setCreateForm((previous) => ({
                      ...previous,
                      productCategory: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>
              <label className={labelClass} htmlFor="create-product-lot">
                Lot Number
                <input
                  id="create-product-lot"
                  value={createForm.lotNumber}
                  onChange={(event) =>
                    setCreateForm((previous) => ({
                      ...previous,
                      lotNumber: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>
              <button
                type="submit"
                className="mt-2 bg-charcoal text-amber font-bold tracking-widest uppercase text-xs py-2.5 px-5 hover:bg-amber hover:text-charcoal transition-colors cursor-pointer rounded-sm"
              >
                Create Product
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2" aria-label="Products list">
          <div className="bg-white border border-charcoal/10 rounded-sm shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-charcoal/8 bg-charcoal/[0.02]">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-charcoal/50 m-0">
                Products
              </h2>
            </div>

            {loading ? (
              <p className="p-5 text-charcoal/50 italic text-sm">Loading products…</p>
            ) : products.length === 0 ? (
              <p className="p-5 text-charcoal/50 italic text-sm">No products found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-charcoal text-white/80">
                    <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                      Lot
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-charcoal/8 hover:bg-charcoal/[0.02]"
                    >
                      <td className="px-4 py-3 text-charcoal font-medium">{product.productName}</td>
                      <td className="px-4 py-3 text-charcoal/60">{product.productCategory}</td>
                      <td className="px-4 py-3 text-charcoal/60 font-mono text-xs">
                        {product.lotNumber}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => beginEditing(product)}
                          className="text-xs border border-charcoal/30 text-charcoal/70 hover:border-charcoal hover:text-charcoal px-3 py-1.5 transition-colors cursor-pointer bg-transparent font-serif rounded-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editingProductId ? (
        <div
          className="bg-white border border-amber/40 rounded-sm p-5 shadow-sm max-w-lg"
          aria-label="Edit product"
        >
          <h2 className="text-xs font-semibold tracking-widest uppercase text-charcoal/50 m-0 mb-4 pb-2 border-b border-charcoal/8">
            Edit Product
          </h2>
          <form onSubmit={onSaveEdit} className="flex flex-col gap-3">
            <label className={labelClass} htmlFor="edit-product-name">
              Product Name
              <input
                id="edit-product-name"
                value={editForm.productName}
                onChange={(event) =>
                  setEditForm((previous) => ({ ...previous, productName: event.target.value }))
                }
                className={inputClass}
              />
            </label>
            <label className={labelClass} htmlFor="edit-product-category">
              Category
              <input
                id="edit-product-category"
                value={editForm.productCategory}
                onChange={(event) =>
                  setEditForm((previous) => ({
                    ...previous,
                    productCategory: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </label>
            <label className={labelClass} htmlFor="edit-product-lot">
              Lot Number
              <input
                id="edit-product-lot"
                value={editForm.lotNumber}
                onChange={(event) =>
                  setEditForm((previous) => ({ ...previous, lotNumber: event.target.value }))
                }
                className={inputClass}
              />
            </label>
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-charcoal text-amber font-bold tracking-widest uppercase text-xs py-2.5 px-5 hover:bg-amber hover:text-charcoal transition-colors cursor-pointer rounded-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setEditForm(initialCreateForm);
                }}
                className="text-xs border border-charcoal/30 text-charcoal/70 hover:border-charcoal hover:text-charcoal px-4 py-2.5 transition-colors cursor-pointer bg-transparent font-serif rounded-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
