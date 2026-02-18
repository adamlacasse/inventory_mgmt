"use client";

import { useEffect, useState } from "react";
import { InventoryPageView } from "./InventoryPageView";
import type { InventoryRow } from "./types";

export function InventoryPageContainer() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRows() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/inventory", { cache: "no-store" });
        const payload = (await response.json()) as {
          rows?: InventoryRow[];
          error?: { message: string };
        };

        if (!response.ok || !payload.rows) {
          throw new Error(payload.error?.message ?? "Failed to load inventory.");
        }

        setRows(payload.rows);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    }

    void loadRows();
  }, []);

  if (loading) {
    return (
      <main>
        <h1>Current Inventory</h1>
        <p>Loading inventory...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Current Inventory</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  return <InventoryPageView rows={rows} />;
}
