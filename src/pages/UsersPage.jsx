import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import SectionCard from "../components/SectionCard";
import StatusBadge from "../components/StatusBadge";
import { readStoredAuth } from "../lib/authStorage";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../lib/api";

const createInitialForm = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
};

const editInitialForm = {
  first_name: "",
  last_name: "",
};

function UserModal({
  mode,
  form,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
}) {
  const isCreate = mode === "create";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6">
      <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-6 shadow-panel">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              {isCreate ? "Create user" : "Update user"}
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              {isCreate
                ? "Add a new dashboard user"
                : "Edit user profile"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {isCreate && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="user@example.com"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                />
              </label>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                First name
              </span>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={onChange}
                placeholder="First name"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Last name
              </span>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={onChange}
                placeholder="Last name"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSubmitting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : isCreate ? (
                <UserPlus size={16} />
              ) : (
                <Pencil size={16} />
              )}

              {isCreate ? "Create user" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const storedAuth = readStoredAuth();
  const token = storedAuth?.access;
  const currentUserId = storedAuth?.user?.id;

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [createForm, setCreateForm] = useState(createInitialForm);
  const [editForm, setEditForm] = useState(editInitialForm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aName =
        `${a.first_name || ""} ${a.last_name || ""}`.trim() ||
        a.email ||
        "";
      const bName =
        `${b.first_name || ""} ${b.last_name || ""}`.trim() ||
        b.email ||
        "";

      return aName.localeCompare(bName);
    });
  }, [users]);

  const loadUsers = async (targetPage = 1) => {
    if (!token) {
      setError("Authentication token missing");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await getUsers(token, targetPage);
      const nextUsers = Array.isArray(data) ? data : data?.results || [];

      setUsers(nextUsers);
      setPagination({
        count: data?.count || nextUsers.length,
        next: data?.next || null,
        previous: data?.previous || null,
      });
      setPage(targetPage);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, [token]);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const created = await createUser(createForm, token);

      setUsers((prev) => [created, ...prev]);
      setCreateForm(createInitialForm);
      setShowCreateModal(false);
      setSuccess("User created successfully");
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
    });
    setError("");
    setSuccess("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const updated = await updateUser({
        id: editingUser.id,
        payload: editForm,
        token,
        isCurrentUser: editingUser.id === currentUserId,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? updated : u))
      );

      setEditingUser(null);
      setSuccess("User updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.email}?`)) return;

    try {
      setError("");
      setSuccess("");

      await deleteUser(user.id, token);

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setSuccess("User deleted successfully");
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  };

  return (
    <SectionCard
      title="User management"
      action={
        <button
          onClick={() => {
            setCreateForm(createInitialForm);
            setShowCreateModal(true);
            setError("");
            setSuccess("");
          }}
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          Add user
        </button>
      }
    >
      <div className="overflow-x-auto">
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading users...
          </div>
        ) : (
          <>
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedUsers.map((user) => {
                  const fullName =
                    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    "Unnamed user";

                  const isCurrentUser = user.id === currentUserId;

                  return (
                    <tr
                      key={user.id || user.email}
                      className="border-t border-slate-100"
                    >
                      <td className="py-4">
                        <p className="font-semibold text-slate-900">
                          {fullName}
                        </p>
                        <p className="text-slate-500">{user.email}</p>
                      </td>

                      <td className="py-4 text-slate-700">
                        {user.role || "User"}
                      </td>

                      <td className="py-4">
                        <StatusBadge
                          value={user.is_staff ? "Active" : "Blocked"}
                        />
                      </td>

                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(user)}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700"
                          >
                            <Trash2 size={14} />
                            {isCurrentUser ? "Delete self" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Page {page} • {users.length} users loaded • {pagination.count} total users
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => loadUsers(page - 1)}
                  disabled={!pagination.previous}
                  className="rounded-full border border-slate-200 px-4 py-2 font-semibold disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  onClick={() => loadUsers(page + 1)}
                  disabled={!pagination.next}
                  className="rounded-full border border-slate-200 px-4 py-2 font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <UserModal
          mode="create"
          form={createForm}
          onChange={handleCreateChange}
          onSubmit={handleCreateSubmit}
          onClose={() => !isSubmitting && setShowCreateModal(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {editingUser && (
        <UserModal
          mode="edit"
          form={editForm}
          onChange={handleEditChange}
          onSubmit={handleEditSubmit}
          onClose={() => !isSubmitting && setEditingUser(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </SectionCard>
  );
}