"use client";

import React, { type FormEvent, useCallback, useEffect, useState } from "react";
import type { ProductRecord } from "./types";

const initialCreateForm = {
  productName: "",
  productCategory: "",
  lotNumber: "",
};

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
      headers: {
        "Content-Type": "application/json",
      },
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
    if (!editingProductId) {
      return;
    }

    setError(null);
    setMessage(null);

    const response = await fetch(`/api/products/${editingProductId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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
    <main>
      <h1>Product Master</h1>
      <p>Create and maintain products by name, category, and lot.</p>

      {error ? <p role="alert">{error}</p> : null}
      {message ? <p>{message}</p> : null}

      <section aria-label="Create product">
        <h2>Add Product</h2>
        <form onSubmit={onCreateProduct}>
          <label htmlFor="create-product-name">
            Product Name
            <input
              id="create-product-name"
              value={createForm.productName}
              onChange={(event) => {
                setCreateForm((previous) => ({
                  ...previous,
                  productName: event.target.value,
                }));
              }}
            />
          </label>
          <label htmlFor="create-product-category">
            Category
            <input
              id="create-product-category"
              value={createForm.productCategory}
              onChange={(event) => {
                setCreateForm((previous) => ({
                  ...previous,
                  productCategory: event.target.value,
                }));
              }}
            />
          </label>
          <label htmlFor="create-product-lot">
            Lot Number
            <input
              id="create-product-lot"
              value={createForm.lotNumber}
              onChange={(event) => {
                setCreateForm((previous) => ({
                  ...previous,
                  lotNumber: event.target.value,
                }));
              }}
            />
          </label>
          <button type="submit">Create Product</button>
        </form>
      </section>

      <section aria-label="Products list">
        <h2>Products</h2>
        {loading ? <p>Loading products...</p> : null}
        {!loading && products.length === 0 ? <p>No products found.</p> : null}
        {!loading && products.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Category</th>
                <th scope="col">Lot</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.productName}</td>
                  <td>{product.productCategory}</td>
                  <td>{product.lotNumber}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        beginEditing(product);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>

      {editingProductId ? (
        <section aria-label="Edit product">
          <h2>Edit Product</h2>
          <form onSubmit={onSaveEdit}>
            <label htmlFor="edit-product-name">
              Product Name
              <input
                id="edit-product-name"
                value={editForm.productName}
                onChange={(event) => {
                  setEditForm((previous) => ({
                    ...previous,
                    productName: event.target.value,
                  }));
                }}
              />
            </label>
            <label htmlFor="edit-product-category">
              Category
              <input
                id="edit-product-category"
                value={editForm.productCategory}
                onChange={(event) => {
                  setEditForm((previous) => ({
                    ...previous,
                    productCategory: event.target.value,
                  }));
                }}
              />
            </label>
            <label htmlFor="edit-product-lot">
              Lot Number
              <input
                id="edit-product-lot"
                value={editForm.lotNumber}
                onChange={(event) => {
                  setEditForm((previous) => ({
                    ...previous,
                    lotNumber: event.target.value,
                  }));
                }}
              />
            </label>
            <button type="submit">Save Changes</button>
            <button
              type="button"
              onClick={() => {
                setEditingProductId(null);
                setEditForm(initialCreateForm);
              }}
            >
              Cancel
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
