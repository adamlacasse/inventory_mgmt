"use client";

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

    if (startDate.length > 0) {
      query.set("startDate", startDate);
    }

    if (endDate.length > 0) {
      query.set("endDate", endDate);
    }

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
      {
        method: "POST",
      },
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
    <main>
      <h1>Transaction History</h1>
      <p>Review intake and outtake records, including lock status.</p>

      {error ? <p role="alert">{error}</p> : null}
      {message ? <p>{message}</p> : null}

      <section aria-label="History filters">
        <h2>Filters</h2>
        <label htmlFor="history-filter-type">
          Type
          <select
            id="history-filter-type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as "all" | "intake" | "outtake");
            }}
          >
            <option value="all">All</option>
            <option value="intake">Intake</option>
            <option value="outtake">Outtake</option>
          </select>
        </label>
        <label htmlFor="history-filter-start-date">
          Start Date
          <input
            id="history-filter-start-date"
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
            }}
          />
        </label>
        <label htmlFor="history-filter-end-date">
          End Date
          <input
            id="history-filter-end-date"
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
            }}
          />
        </label>
      </section>

      {loading ? <p>Loading transaction history...</p> : null}
      {!loading && transactions.length === 0 ? (
        <p>No transactions found for current filters.</p>
      ) : null}

      {!loading && transactions.length > 0 ? (
        <section aria-label="Transactions list">
          {transactions.map((transaction) => (
            <article key={`${transaction.type}-${transaction.id}`}>
              <h3>
                {transaction.type.toUpperCase()} | {transaction.id}
              </h3>
              <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
              <p>Status: {transaction.locked ? "Locked" : "Unlocked"}</p>
              {transaction.customer ? <p>Customer: {transaction.customer}</p> : null}
              {transaction.notes ? <p>Notes: {transaction.notes}</p> : null}

              <table>
                <thead>
                  <tr>
                    <th scope="col">Product</th>
                    <th scope="col">Category</th>
                    <th scope="col">Lot</th>
                    <th scope="col">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.lineItems.map((lineItem) => (
                    <tr
                      key={`${transaction.id}-${lineItem.productId}-${lineItem.lotNumber}-${lineItem.units}`}
                    >
                      <td>{lineItem.productName}</td>
                      <td>{lineItem.productCategory}</td>
                      <td>{lineItem.lotNumber}</td>
                      <td>{lineItem.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transaction.locked ? (
                <button
                  type="button"
                  onClick={() => {
                    void setLockState(transaction, false);
                  }}
                >
                  Unlock
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void setLockState(transaction, true);
                  }}
                >
                  Lock
                </button>
              )}

              <a href={transaction.type === "intake" ? "/intake" : "/outtake"}>
                Edit in {transaction.type}
              </a>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
