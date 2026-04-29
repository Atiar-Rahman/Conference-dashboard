import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Calendar,
    FileText,
    Loader2,
    Link2,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    year: "",
    title: "",
    description: "",
};

const Archives = () => {
    const { conferencePk } = useParams();
    const navigate = useNavigate();
    const token = readStoredAuth()?.access;

    const [archives, setArchives] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/archive/`;

    // API
    const getItems = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
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

    // LOAD
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

            setArchives(parsed);
        } catch (err) {
            setError(err.message);
            setArchives([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) {
            loadItems();
        }
    }, [conferencePk]);

    // FORM
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
            year: item.year || "",
            title: item.title || "",
            description: item.description || "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(false);
    };

    // SUBMIT
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitLoading(true);

            const payload = {
                year: Number(form.year),
                title: form.title,
                description: form.description,
            };

            if (editing?.id) {
                await updateItem(editing.id, payload);

                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text: "Archive updated successfully",
                    timer: 1200,
                    showConfirmButton: false,
                });
            } else {
                await createItem(payload);

                Swal.fire({
                    icon: "success",
                    title: "Created",
                    text: "Archive created successfully",
                    timer: 1200,
                    showConfirmButton: false,
                });
            }

            closeModal();
            loadItems();
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err.message,
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    // DELETE
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete archive?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteItem(id);

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1200,
                showConfirmButton: false,
            });

            loadItems();
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err.message,
            });
        }
    };

    const openArchiveLinks = (archiveId) => {
        navigate(
            `/conference/${conferencePk}/archives/${archiveId}/archive-links`
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Archives</h2>
                    <p className="text-sm text-slate-500">
                        Manage conference archive records
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Add Archive
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !archives.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No archive found
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">Year</th>
                                    <th className="px-6 py-4 text-left">Title</th>
                                    <th className="px-6 py-4 text-left">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 text-center">
                                        Links
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {archives.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                                <Calendar size={15} />
                                                {item.year}
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 font-medium">
                                            {item.title}
                                        </td>

                                        <td className="max-w-md px-6 py-5 text-sm text-slate-500">
                                            <p className="line-clamp-2">
                                                {item.description || "-"}
                                            </p>
                                        </td>

                                        <td className="px-6 py-5 text-center">
                                            <button
                                                onClick={() =>
                                                    openArchiveLinks(item.id)
                                                }
                                                className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                                            >
                                                <Link2 size={15} />
                                                Manage Links
                                            </button>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
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
                                                        handleDelete(item.id)
                                                    }
                                                    className="rounded-xl bg-red-100 p-3 text-red-600 hover:bg-red-200"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                {editing ? "Edit Archive" : "Create Archive"}
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
                                type="number"
                                name="year"
                                required
                                value={form.year}
                                onChange={handleChange}
                                placeholder="Year"
                                className="w-full rounded-2xl border p-4"
                            />

                            <input
                                type="text"
                                name="title"
                                required
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Archive title"
                                className="w-full rounded-2xl border p-4"
                            />

                            <textarea
                                rows={5}
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Archive details..."
                                className="w-full rounded-2xl border p-4"
                            />

                            <button
                                disabled={submitLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-white disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Archive"
                                        : "Create Archive"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Archives;