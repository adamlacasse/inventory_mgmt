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
    <main>
      <div className="admin-users">
        <div className="admin-users__header">
          <h1>User Management</h1>
          <button
            type="button"
            className="admin-users__add-btn"
            onClick={() => setShowAdd((v) => !v)}
          >
            {showAdd ? "Cancel" : "+ Add User"}
          </button>
        </div>

        {showAdd && (
          <form className="admin-users__add-form" onSubmit={handleAdd}>
            <h2>New User</h2>
            {addError && <p className="admin-users__error">{addError}</p>}
            <label>
              Email
              <input
                type="email"
                required
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label>
              Name
              <input
                type="text"
                required
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={addForm.password}
                onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>
            <label>
              Role
              <select
                value={addForm.role}
                onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={addSubmitting}>
              {addSubmitting ? "Creating…" : "Create User"}
            </button>
          </form>
        )}

        {actionError && <p className="admin-users__error">{actionError}</p>}

        <table className="admin-users__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={u.active ? "" : "admin-users__row--inactive"}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  {editingId === u.id ? (
                    <span className="admin-users__role-edit">
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <button type="button" onClick={() => handleRoleChange(u.id)}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <span className="admin-users__role-badge" data-role={u.role}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={`admin-users__status ${u.active ? "admin-users__status--active" : "admin-users__status--inactive"}`}
                  >
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="admin-users__actions">
                  {u.active && editingId !== u.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(u.id);
                          setEditRole(u.role);
                          setActionError(null);
                        }}
                      >
                        Edit Role
                      </button>
                      {u.id !== actorId && (
                        <button
                          type="button"
                          className="admin-users__deactivate-btn"
                          onClick={() => handleDeactivate(u.id)}
                        >
                          Deactivate
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
