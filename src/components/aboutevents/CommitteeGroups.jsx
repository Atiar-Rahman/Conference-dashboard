import { useEffect, useState } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Save,
    Loader2,
    Users,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    title: "",
};

const CommitteeGroups = () => {
    const { conferencePk, groupPk } = useParams();
    const navigate = useNavigate();
    const token = readStoredAuth()?.access;

    const [groups, setGroups] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/committee-group/`;

    // ================= API =================
    const getItems = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
            csrf: true,
        });

    const createItem = (payload) =>
        apiRequest(endpoint, {
            method: "POST",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });

    const updateItem = async (id, payload) => {
        try {
            return await apiRequest(`${endpoint}${id}/`, {
                method: "PATCH",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            });
        } catch (err) {
            if (err?.status !== 405) throw err;

            return apiRequest(`${endpoint}${id}/`, {
                method: "PUT",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            });
        }
    };

    const deleteItem = (id) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

    // ================= LOAD =================
    const loadItems = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getItems();

            const parsed = Array.isArray(data)
                ? data
                : data?.results
                    ? data.results
                    : data
                        ? [data]
                        : [];

            setGroups(parsed);
        } catch (err) {
            setGroups([]);
            setError(err.message || "Failed to load groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk && !groupPk) {
            loadItems();
        }
    }, [conferencePk, groupPk]);

    // ================= FORM =================
    const handleChange = (e) => {
        setForm({
            title: e.target.value,
        });
    };

    const openCreate = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            title: item.title || "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(false);
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitLoading(true);

            const id = editing?.id || editing?.pk;

            if (id) {
                await updateItem(id, form);

                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createItem(form);

                Swal.fire({
                    icon: "success",
                    title: "Created",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }

            closeModal();
            await loadItems();
        } catch (err) {
            setError(err.message);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err.message,
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete group?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteItem(id);
            await loadItems();

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err.message,
            });
        }
    };

    // ================= NAVIGATION =================
    const openMembers = (groupId) => {
        navigate(
            `/conference/${conferencePk}/committee-groups/${groupId}/group-member`
        );
    };

    // child route render
    if (groupPk) {
        return <Outlet />;
    }

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Committee Groups
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage committee groups
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
                >
                    <Plus size={18} />
                    Add Group
                </button>
            </div>

            {/* error */}
            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* list */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" />
                        Loading...
                    </div>
                ) : !groups.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No committee group found
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left">Title</th>
                                <th className="px-6 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {groups.map((item) => {
                                const id = item.id || item.pk;

                                return (
                                    <tr
                                        key={id}
                                        className="border-b hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <Users size={18} />
                                                <span className="font-medium">
                                                    {item.title}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2 flex-wrap">
                                                <button
                                                    onClick={() =>
                                                        openMembers(id)
                                                    }
                                                    className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                                                >
                                                    Members
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openEdit(item)
                                                    }
                                                    className="rounded-xl bg-slate-100 p-3 hover:bg-slate-200"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(id)
                                                    }
                                                    className="rounded-xl bg-red-100 p-3 text-red-600 hover:bg-red-200"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                {editing ? "Update Group" : "Create Group"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Group Title"
                                required
                                className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-black"
                            />

                            <button
                                disabled={submitLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-white disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Group"
                                        : "Create Group"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommitteeGroups;