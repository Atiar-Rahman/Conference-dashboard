import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";
import { useParams, useNavigate } from "react-router-dom";

const initialForm = {
    name: "",
};

const Track = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/track/`;

    const openPaper = (trackId) => {
        navigate(
            `/conference/${conferencePk}/track/${trackId}/papers`
        );
    };
    const openSessions = (trackId) => {
        navigate(
            `/conference/${conferencePk}/track/${trackId}/session`
        );
    };

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

    const updateItem = (id, payload) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "PATCH",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });

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

            setItems(parsed);
        } catch (err) {
            setError(err.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) loadItems();
    }, [conferencePk]);

    // ================= FORM =================
    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const openCreate = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            name: item.name || "",
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
                    text: "Track updated successfully",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createItem(form);

                Swal.fire({
                    icon: "success",
                    title: "Created",
                    text: "Track created successfully",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }

            closeModal();
            loadItems();
        } catch (err) {
            setError(err.message);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message,
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete track?",
            text: "You won't be able to undo this.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteItem(id);
            loadItems();

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1200,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message,
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Conference Tracks
                    </h2>
                    <p className="text-sm text-slate-500">
                        Manage conference track list
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Track
                </button>
            </div>

            {/* error */}
            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* table */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No track found
                    </div>
                ) : (
                    <div className="max-h-[600px] overflow-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead className="sticky top-0 z-10 border-b bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left whitespace-nowrap">
                                        Track Name
                                    </th>
                                    <th className="px-4 py-3 text-left whitespace-nowrap">
                                        Conference
                                    </th>
                                    <th className="px-4 py-3 text-left whitespace-nowrap">
                                        Location
                                    </th>
                                    <th className="px-4 py-3 text-left whitespace-nowrap">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 text-left whitespace-nowrap">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-right whitespace-nowrap">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => {
                                    const id = item.id || item.pk;
                                    const conference = item.conference || {};
                                    const user = item.user || {};

                                    return (
                                        <tr
                                            key={id}
                                            className="border-b hover:bg-slate-50 align-top"
                                        >
                                            <td className="px-4 py-4 font-medium text-slate-900">
                                                {item.name}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium">
                                                        {conference.name || "-"}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {conference.short_name || "-"}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                {conference.location || "-"}
                                            </td>

                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {conference.start_date} → {conference.end_date}
                                            </td>

                                            <td className="px-4 py-4">
                                                {user.email || "-"}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openSessions(id)}
                                                        className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
                                                    >
                                                        Sessions
                                                    </button>
                                                    <button
                                                        onClick={() => openPaper(id)}
                                                        className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                                                    >
                                                        Papers
                                                    </button>

                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="rounded-lg bg-slate-100 p-3 hover:bg-slate-200"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(id)}
                                                        className="rounded-lg bg-red-100 p-3 text-red-600 hover:bg-red-200"
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
                    </div>
                )}
            </div>

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">
                                {editing ? "Edit Track" : "Create Track"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Track name"
                                required
                                className="w-full rounded-2xl border border-slate-200 p-4 outline-none focus:border-black"
                            />

                            <button
                                disabled={submitLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-semibold text-white disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Track"
                                        : "Save Track"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Track;