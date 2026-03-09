"use client";

import { EmptyState, FilterToolbar, SectionCard, StatusBanner } from "@inventory/ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface HistoryLineItem {
  productId: string;
  productName: string;
  productCategory: string;
  lotNumber: string;
  units: number;
}

interface HistoryTransaction {
  id: string;
  type: "intake" | "outtake";
  date: string;
  locked: boolean;
  customer?: string;
  notes?: string;
  lineItems: HistoryLineItem[];
}

export function HistoryPageView() {
  const [type, setType] = useState<"all" | "intake" | "outtake">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transactions, setTransactions] = useState<HistoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const query = new URLSearchParams();
    query.set("type", type);
    if (startDate.length > 0) query.set("startDate", startDate);
    if (endDate.length > 0) query.set("endDate", endDate);
    return query.toString();
  }, [endDate, startDate, type]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/history?${queryString}`, { cache: "no-store" });
      const payload = (await response.json()) as {
        transactions?: HistoryTransaction[];
        error?: { message: string };
      };
      if (!response.ok || !payload.transactions) {
        throw new Error(payload.error?.message ?? "Failed to load transaction history.");
      }
      setTransactions(payload.transactions);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load transaction history.",
      );
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  async function setLockState(transaction: HistoryTransaction, locked: boolean) {
    setError(null);
    setMessage(null);
    const action = locked ? "lock" : "unlock";
    const response = await fetch(
      `/api/transactions/${transaction.type}/${transaction.id}/${action}`,
      { method: "POST" },
    );
    const payload = (await response.json()) as {
      transaction?: { id: string; type: "intake" | "outtake"; locked: boolean };
      error?: { message: string };
    };
    if (!response.ok || !payload.transaction) {
      setError(payload.error?.message ?? `Failed to ${action} transaction.`);
      return;
    }
    setMessage(`Transaction ${payload.transaction.id} ${locked ? "locked" : "unlocked"}.`);
    await loadHistory();
  }

  return (
    <div className="page-stack">
      <div>
        <h1 className="page-title">Transaction History</h1>
        <p className="page-subtitle">Review intake and outtake records, including lock status.</p>
      </div>

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}
      {message ? <StatusBanner variant="success">{message}</StatusBanner> : null}

      <FilterToolbar aria-label="History filters">
        <h2
          className="section-card-header"
          style={{ width: "100%", border: 0, background: "none", padding: 0, marginBottom: 4 }}
        >
          Filters
        </h2>
        <div className="filter-field" style={{ minWidth: "112px" }}>
          <label className="form-label" htmlFor="history-filter-type">
            Type
            <select
              id="history-filter-type"
              value={type}
              onChange={(event) => setType(event.target.value as "all" | "intake" | "outtake")}
              className="form-input"
            >
              <option value="all">All</option>
              <option value="intake">Intake</option>
              <option value="outtake">Outtake</option>
            </select>
          </label>
        </div>
        <div className="filter-field">
          <label className="form-label" htmlFor="history-filter-start-date">
            Start Date
            <input
              id="history-filter-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="form-input"
            />
          </label>
        </div>
        <div className="filter-field">
          <label className="form-label" htmlFor="history-filter-end-date">
            End Date
            <input
              id="history-filter-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="form-input"
            />
          </label>
        </div>
      </FilterToolbar>

      {loading ? <EmptyState>Loading transaction history…</EmptyState> : null}
      {!loading && transactions.length === 0 ? (
        <EmptyState>No transactions found for current filters.</EmptyState>
      ) : null}

      {!loading && transactions.length > 0 ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          aria-label="Transactions list"
        >
          {transactions.map((transaction) => (
            <SectionCard key={`${transaction.type}-${transaction.id}`}>
              {/* Card header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(28,37,44,0.08)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "12px",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}
                >
                  <span className={`badge badge-${transaction.type}`}>{transaction.type}</span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: "rgba(28,37,44,0.5)",
                    }}
                  >
                    {transaction.id}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: "rgba(28,37,44,0.7)" }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                  <span
                    className={`badge ${transaction.locked ? "badge-locked" : "badge-unlocked"}`}
                  >
                    {transaction.locked ? "Locked" : "Unlocked"}
                  </span>
                </div>

                <div className="actions-row">
                  {transaction.locked ? (
                    <button
                      type="button"
                      onClick={() => void setLockState(transaction, false)}
                      className="btn-outline"
                    >
                      Unlock
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void setLockState(transaction, true)}
                      className="btn-brand"
                      style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                    >
                      Lock
                    </button>
                  )}
                  <a
                    href={transaction.type === "intake" ? "/intake" : "/outtake"}
                    className="btn-outline"
                    style={{ textDecoration: "none" }}
                  >
                    Edit
                  </a>
                </div>
              </div>

              {/* Meta */}
              {(transaction.customer ?? transaction.notes) ? (
                <div
                  style={{
                    padding: "8px 20px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 24px",
                    fontSize: "0.875rem",
                    color: "rgba(28,37,44,0.6)",
                    background: "rgba(28,37,44,0.015)",
                    borderBottom: "1px solid rgba(28,37,44,0.08)",
                  }}
                >
                  {transaction.customer ? (
                    <span>
                      <strong style={{ color: "rgba(28,37,44,0.8)" }}>Customer:</strong>{" "}
                      {transaction.customer}
                    </span>
                  ) : null}
                  {transaction.notes ? (
                    <span>
                      <strong style={{ color: "rgba(28,37,44,0.8)" }}>Notes:</strong>{" "}
                      {transaction.notes}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {/* Line items table */}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Lot</th>
                    <th className="col-right">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.lineItems.map((lineItem) => (
                    <tr
                      key={`${transaction.id}-${lineItem.productId}-${lineItem.lotNumber}-${lineItem.units}`}
                    >
                      <td style={{ fontWeight: 500 }}>{lineItem.productName}</td>
                      <td style={{ color: "rgba(28,37,44,0.6)" }}>{lineItem.productCategory}</td>
                      <td className="col-mono" style={{ color: "rgba(28,37,44,0.6)" }}>
                        {lineItem.lotNumber}
                      </td>
                      <td className="col-right" style={{ fontWeight: 600 }}>
                        {lineItem.units}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          ))}
        </div>
      ) : null}
    </div>
  );
}
