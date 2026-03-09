"use client";

import { EmptyState, SectionCard, StatusBanner } from "@inventory/ui";
import React, { type FormEvent, useCallback, useEffect, useState } from "react";
import type { ProductRecord } from "./types";

const initialCreateForm = { productName: "", productCategory: "", lotNumber: "" };

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
    <div className="page-stack">
      <div>
        <h1 className="page-title">Product Master</h1>
        <p className="page-subtitle">Create and maintain products by name, category, and lot.</p>
      </div>

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}
      {message ? <StatusBanner variant="success">{message}</StatusBanner> : null}

      <div className="grid-layout-1-2">
        <div>
          <SectionCard aria-label="Create product">
            <h2 className="section-card-header">Add Product</h2>
            <div className="section-card-body">
              <form onSubmit={onCreateProduct} className="form-stack">
                <label className="form-label" htmlFor="create-product-name">
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
                    className="form-input"
                  />
                </label>
                <label className="form-label" htmlFor="create-product-category">
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
                    className="form-input"
                  />
                </label>
                <label className="form-label" htmlFor="create-product-lot">
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
                    className="form-input"
                  />
                </label>
                <button type="submit" className="btn-brand" style={{ marginTop: "8px" }}>
                  Create Product
                </button>
              </form>
            </div>
          </SectionCard>
        </div>

        <div aria-label="Products list">
          <SectionCard>
            <h2 className="section-card-header">Products</h2>
            {loading ? (
              <div className="section-card-body">
                <EmptyState>Loading products…</EmptyState>
              </div>
            ) : products.length === 0 ? (
              <div className="section-card-body">
                <EmptyState>No products found.</EmptyState>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Lot</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: 500 }}>{product.productName}</td>
                      <td style={{ color: "rgba(28,37,44,0.6)" }}>{product.productCategory}</td>
                      <td className="col-mono" style={{ color: "rgba(28,37,44,0.6)" }}>
                        {product.lotNumber}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => beginEditing(product)}
                          className="btn-outline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>
      </div>

      {editingProductId ? (
        <div style={{ maxWidth: "32rem" }}>
          <SectionCard aria-label="Edit product">
            <h2 className="section-card-header">Edit Product</h2>
            <div className="section-card-body">
              <form onSubmit={onSaveEdit} className="form-stack">
                <label className="form-label" htmlFor="edit-product-name">
                  Product Name
                  <input
                    id="edit-product-name"
                    value={editForm.productName}
                    onChange={(event) =>
                      setEditForm((previous) => ({ ...previous, productName: event.target.value }))
                    }
                    className="form-input"
                  />
                </label>
                <label className="form-label" htmlFor="edit-product-category">
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
                    className="form-input"
                  />
                </label>
                <label className="form-label" htmlFor="edit-product-lot">
                  Lot Number
                  <input
                    id="edit-product-lot"
                    value={editForm.lotNumber}
                    onChange={(event) =>
                      setEditForm((previous) => ({
                        ...previous,
                        lotNumber: event.target.value,
                      }))
                    }
                    className="form-input"
                  />
                </label>
                <div className="actions-row" style={{ marginTop: "8px" }}>
                  <button type="submit" className="btn-brand">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setEditForm(initialCreateForm);
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}
