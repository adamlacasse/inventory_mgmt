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

const inputClass =
  "border border-charcoal/20 bg-white px-3 py-2 text-sm font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm w-full";
const labelClass =
  "flex flex-col gap-1 text-xs font-semibold tracking-widest uppercase text-charcoal/60";

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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wide text-charcoal m-0">Transaction History</h1>
        <p className="text-charcoal/60 mt-1 m-0">
          Review intake and outtake records, including lock status.
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

      {/* Filters */}
      <div
        className="bg-white border border-charcoal/10 rounded-sm p-5 flex flex-wrap gap-4 items-end shadow-sm"
        aria-label="History filters"
      >
        <h2 className="w-full text-xs font-semibold tracking-widest uppercase text-charcoal/50 m-0 pb-2 border-b border-charcoal/8">
          Filters
        </h2>
        <label className={`${labelClass} flex-1 min-w-28`} htmlFor="history-filter-type">
          Type
          <select
            id="history-filter-type"
            value={type}
            onChange={(event) => setType(event.target.value as "all" | "intake" | "outtake")}
            className={inputClass}
          >
            <option value="all">All</option>
            <option value="intake">Intake</option>
            <option value="outtake">Outtake</option>
          </select>
        </label>
        <label className={`${labelClass} flex-1 min-w-36`} htmlFor="history-filter-start-date">
          Start Date
          <input
            id="history-filter-start-date"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={inputClass}
          />
        </label>
        <label className={`${labelClass} flex-1 min-w-36`} htmlFor="history-filter-end-date">
          End Date
          <input
            id="history-filter-end-date"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      {loading ? (
        <p className="text-charcoal/50 italic text-sm">Loading transaction history…</p>
      ) : null}
      {!loading && transactions.length === 0 ? (
        <p className="text-charcoal/50 italic text-sm">
          No transactions found for current filters.
        </p>
      ) : null}

      {!loading && transactions.length > 0 ? (
        <div className="flex flex-col gap-4" aria-label="Transactions list">
          {transactions.map((transaction) => (
            <div
              key={`${transaction.type}-${transaction.id}`}
              className="bg-white border border-charcoal/10 rounded-sm shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="px-5 py-4 border-b border-charcoal/8 flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={[
                      "inline-block px-2.5 py-0.5 text-xs font-bold tracking-widest uppercase rounded-sm",
                      transaction.type === "intake"
                        ? "bg-charcoal text-amber"
                        : "bg-amber text-charcoal",
                    ].join(" ")}
                  >
                    {transaction.type}
                  </span>
                  <span className="font-mono text-xs text-charcoal/50">{transaction.id}</span>
                  <span className="text-sm text-charcoal/70">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                  <span
                    className={[
                      "inline-block px-2 py-0.5 text-xs font-semibold tracking-widest uppercase rounded-sm",
                      transaction.locked
                        ? "bg-charcoal/8 text-charcoal/60"
                        : "bg-amber/20 text-charcoal",
                    ].join(" ")}
                  >
                    {transaction.locked ? "Locked" : "Unlocked"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {transaction.locked ? (
                    <button
                      type="button"
                      onClick={() => void setLockState(transaction, false)}
                      className="text-xs border border-charcoal/30 text-charcoal/70 hover:border-charcoal hover:text-charcoal px-3 py-1.5 transition-colors cursor-pointer bg-transparent font-serif rounded-sm"
                    >
                      Unlock
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void setLockState(transaction, true)}
                      className="text-xs bg-charcoal text-amber hover:bg-amber hover:text-charcoal px-3 py-1.5 transition-colors cursor-pointer border-0 font-serif rounded-sm"
                    >
                      Lock
                    </button>
                  )}
                  <a
                    href={transaction.type === "intake" ? "/intake" : "/outtake"}
                    className="text-xs border border-charcoal/20 text-charcoal/60 hover:text-charcoal px-3 py-1.5 transition-colors no-underline rounded-sm"
                  >
                    Edit
                  </a>
                </div>
              </div>

              {/* Meta */}
              {(transaction.customer ?? transaction.notes) ? (
                <div className="px-5 py-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-charcoal/60 bg-charcoal/[0.015] border-b border-charcoal/8">
                  {transaction.customer ? (
                    <span>
                      <strong className="text-charcoal/80">Customer:</strong> {transaction.customer}
                    </span>
                  ) : null}
                  {transaction.notes ? (
                    <span>
                      <strong className="text-charcoal/80">Notes:</strong> {transaction.notes}
                    </span>
                  ) : null}
                </div>
              ) : null}

              {/* Line items table */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal/8 bg-charcoal/[0.03]">
                    <th className="text-left px-5 py-2 text-xs font-semibold tracking-widest uppercase text-charcoal/50">
                      Product
                    </th>
                    <th className="text-left px-5 py-2 text-xs font-semibold tracking-widest uppercase text-charcoal/50">
                      Category
                    </th>
                    <th className="text-left px-5 py-2 text-xs font-semibold tracking-widest uppercase text-charcoal/50">
                      Lot
                    </th>
                    <th className="text-right px-5 py-2 text-xs font-semibold tracking-widest uppercase text-charcoal/50">
                      Units
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.lineItems.map((lineItem) => (
                    <tr
                      key={`${transaction.id}-${lineItem.productId}-${lineItem.lotNumber}-${lineItem.units}`}
                      className="border-t border-charcoal/5"
                    >
                      <td className="px-5 py-2.5 text-charcoal font-medium">
                        {lineItem.productName}
                      </td>
                      <td className="px-5 py-2.5 text-charcoal/60">{lineItem.productCategory}</td>
                      <td className="px-5 py-2.5 text-charcoal/60 font-mono text-xs">
                        {lineItem.lotNumber}
                      </td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular-nums">
                        {lineItem.units}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
