"use client";

import { SectionCard, StatusBanner } from "@inventory/ui";
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
    <div className="page-stack">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage user accounts and role assignments.</p>
        </div>
        <button type="button" onClick={() => setShowAdd((v) => !v)} className="btn-brand">
          {showAdd ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {showAdd && (
        <div style={{ maxWidth: "28rem" }}>
          <SectionCard>
            <h2 className="section-card-header">New User</h2>
            <div className="section-card-body form-stack">
              {addError && <StatusBanner variant="error">{addError}</StatusBanner>}
              <form onSubmit={handleAdd} className="form-stack">
                <label className="form-label">
                  Email
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                    className="form-input"
                  />
                </label>
                <label className="form-label">
                  Name
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                    className="form-input"
                  />
                </label>
                <label className="form-label">
                  Password
                  <input
                    type="password"
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                    className="form-input"
                  />
                </label>
                <label className="form-label">
                  Role
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
                    className="form-input"
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
                  className="btn-brand"
                  style={{ marginTop: "4px" }}
                >
                  {addSubmitting ? "Creating…" : "Create User"}
                </button>
              </form>
            </div>
          </SectionCard>
        </div>
      )}

      {actionError && (
        <div style={{ maxWidth: "32rem" }}>
          <StatusBanner variant="error">{actionError}</StatusBanner>
        </div>
      )}

      <SectionCard>
        <table className="data-table">
          <thead>
            <tr>
              {["Name", "Email", "Role", "Status", "Actions"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ opacity: u.active ? undefined : 0.5 }}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td className="col-mono" style={{ color: "rgba(28,37,44,0.6)" }}>
                  {u.email}
                </td>
                <td>
                  {editingId === u.id ? (
                    <span className="actions-row">
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="form-input"
                        style={{ width: "auto", padding: "4px 8px", fontSize: "0.75rem" }}
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
                        className="btn-brand"
                        style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn-outline"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span
                      className={`badge ${u.role === "admin" ? "badge-role-admin" : "badge-role-other"}`}
                    >
                      {u.role}
                    </span>
                  )}
                </td>
                <td>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: u.active ? "#15803d" : "rgba(28,37,44,0.4)",
                    }}
                  >
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {u.active && editingId !== u.id && (
                    <div className="actions-row">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(u.id);
                          setEditRole(u.role);
                          setActionError(null);
                        }}
                        className="btn-outline"
                      >
                        Edit Role
                      </button>
                      {u.id !== actorId && (
                        <button
                          type="button"
                          onClick={() => handleDeactivate(u.id)}
                          className="btn-danger-outline"
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
      </SectionCard>
    </div>
  );
}
