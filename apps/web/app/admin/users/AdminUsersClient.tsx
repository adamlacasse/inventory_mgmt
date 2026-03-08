"use client";

import { useState } from "react";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: Date | string;
};

type Props = {
  initialUsers: UserRow[];
  actorId: string;
};

const ROLES = ["viewer", "operator", "admin"] as const;

const inputClass =
  "border border-charcoal/20 bg-white px-3 py-2 text-sm font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm w-full";
const labelClass =
  "flex flex-col gap-1 text-xs font-semibold tracking-widest uppercase text-charcoal/60";

export function AdminUsersClient({ initialUsers, actorId }: Props) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", name: "", password: "", role: "operator" });
  const [addError, setAddError] = useState<string | null>(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const json = (await res.json()) as { user?: UserRow; error?: { message: string } };
      if (!res.ok) {
        setAddError(json.error?.message ?? "Failed to create user.");
        return;
      }
      if (json.user) {
        const createdUser = json.user;
        setUsers((u) => [...u, createdUser]);
      }
      setAddForm({ email: "", name: "", password: "", role: "operator" });
      setShowAdd(false);
    } catch {
      setAddError("Unexpected error.");
    } finally {
      setAddSubmitting(false);
    }
  }

  async function handleRoleChange(id: string) {
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      });
      const json = (await res.json()) as { user?: UserRow; error?: { message: string } };
      if (!res.ok) {
        setActionError(json.error?.message ?? "Failed to update role.");
        return;
      }
      if (json.user) {
        const updatedUser = json.user;
        setUsers((u) => u.map((x) => (x.id === id ? updatedUser : x)));
      }
      setEditingId(null);
    } catch {
      setActionError("Unexpected error.");
    }
  }

  async function handleDeactivate(id: string) {
    setActionError(null);
    if (!confirm("Deactivate this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { user?: UserRow; error?: { message: string } };
      if (!res.ok) {
        setActionError(json.error?.message ?? "Failed to deactivate user.");
        return;
      }
      if (json.user) {
        const deactivatedUser = json.user;
        setUsers((u) => u.map((x) => (x.id === id ? deactivatedUser : x)));
      }
    } catch {
      setActionError("Unexpected error.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-wide text-charcoal m-0">User Management</h1>
          <p className="text-charcoal/60 mt-1 m-0">Manage user accounts and role assignments.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="bg-charcoal text-amber font-bold tracking-widest uppercase text-xs py-2.5 px-5 hover:bg-amber hover:text-charcoal transition-colors cursor-pointer rounded-sm border-0"
        >
          {showAdd ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-charcoal/10 rounded-sm p-5 shadow-sm max-w-md">
          <h2 className="text-xs font-semibold tracking-widest uppercase text-charcoal/50 m-0 mb-4 pb-2 border-b border-charcoal/8">
            New User
          </h2>
          {addError && (
            <div className="mb-3 px-3 py-2.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-sm">
              {addError}
            </div>
          )}
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <label className={labelClass}>
              Email
              <input
                type="email"
                required
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Name
              <input
                type="text"
                required
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Password
              <input
                type="password"
                required
                value={addForm.password}
                onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Role
              <select
                value={addForm.role}
                onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                className={inputClass}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={addSubmitting}
              className="mt-1 bg-charcoal text-amber font-bold tracking-widest uppercase text-xs py-2.5 px-5 hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer rounded-sm border-0"
            >
              {addSubmitting ? "Creating…" : "Create User"}
            </button>
          </form>
        </div>
      )}

      {actionError && (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-sm max-w-lg">
          {actionError}
        </div>
      )}

      <div className="bg-white border border-charcoal/10 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-charcoal text-white/80">
              {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold tracking-widest uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className={[
                  "border-t border-charcoal/8",
                  !u.active ? "opacity-50" : "hover:bg-charcoal/[0.015]",
                ].join(" ")}
              >
                <td className="px-4 py-3 font-medium text-charcoal">{u.name}</td>
                <td className="px-4 py-3 text-charcoal/60 text-xs font-mono">{u.email}</td>
                <td className="px-4 py-3">
                  {editingId === u.id ? (
                    <span className="flex items-center gap-2">
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="border border-charcoal/20 bg-white px-2 py-1 text-xs font-serif text-charcoal focus:outline-none focus:border-charcoal rounded-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRoleChange(u.id)}
                        className="text-xs bg-charcoal text-amber hover:bg-amber hover:text-charcoal px-2 py-1 transition-colors cursor-pointer border-0 font-serif rounded-sm"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs border border-charcoal/30 text-charcoal/60 hover:border-charcoal hover:text-charcoal px-2 py-1 transition-colors cursor-pointer bg-transparent font-serif rounded-sm"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span
                      className={[
                        "inline-block px-2 py-0.5 text-xs font-semibold tracking-widest uppercase rounded-sm",
                        u.role === "admin"
                          ? "bg-amber text-charcoal"
                          : "bg-charcoal/8 text-charcoal/70",
                      ].join(" ")}
                    >
                      {u.role}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "text-xs font-semibold",
                      u.active ? "text-green-700" : "text-charcoal/40",
                    ].join(" ")}
                  >
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.active && editingId !== u.id && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(u.id);
                          setEditRole(u.role);
                          setActionError(null);
                        }}
                        className="text-xs border border-charcoal/30 text-charcoal/70 hover:border-charcoal hover:text-charcoal px-3 py-1.5 transition-colors cursor-pointer bg-transparent font-serif rounded-sm"
                      >
                        Edit Role
                      </button>
                      {u.id !== actorId && (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(u.id)}
                          className="text-xs border border-red-300 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 px-3 py-1.5 transition-colors cursor-pointer bg-transparent font-serif rounded-sm"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
