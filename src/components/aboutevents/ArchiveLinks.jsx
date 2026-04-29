import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    Link as LinkIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";


const initialForm = {
    label: "",
    url: "",
};

const ArchiveLinks = () => {
    const { conferencePk, archivePk } = useParams();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/archive/${archivePk}/archive-links/`;

    // API
    // API
    const getItems = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
        });

    const createItem = (payload) => {
        console.log("payload =", payload);

        return apiRequest(endpoint, {
            method: "POST",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });
    };

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
    // console.log("endpoint =", endpoint);
    // console.log("conferencePk =", conferencePk);
    // console.log("archivePk =", archivePk);
    // console.log("token =", token);
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

            setItems(parsed);
        } catch (err) {
            setError(err.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk && archivePk) {
            loadItems();
        }
    }, [conferencePk, archivePk]);
    console.log(conferencePk,archivePk)
    console.log(items)

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
            label: item.label || "",
            url: item.url || "",
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

        if (!form.url.startsWith("http")) {
            return Swal.fire({
                icon: "warning",
                title: "Invalid URL",
                text: "Use full URL",
            });
        }

        try {
            setSubmitLoading(true);

            const payload = {
                label: form.label,
                url: form.url,
            };

            console.log("submit payload =", payload);

            if (editing?.id) {
                await updateItem(editing.id, payload);
            } else {
                await createItem(payload);
            }

            Swal.fire({
                icon: "success",
                title: "Success",
                timer: 1200,
                showConfirmButton: false,
            });

            closeModal();
            loadItems();
        } catch (err) {
            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err?.data
                    ? JSON.stringify(err.data)
                    : err.message,
            });
        } finally {
            setSubmitLoading(false);
        }
    };
    // DELETE
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete archive link?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
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
                title: "Failed",
                text: err.message,
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Archive Links</h2>
                    <p className="text-sm text-slate-500">
                        Manage archive resources & links
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Add Link
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
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No archive link found
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">Label</th>
                                    <th className="px-6 py-4 text-left">URL</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => {
                                    const id = item.id || item.pk;

                                    return (
                                        <tr key={id} className="border-b hover:bg-slate-50">
                                            <td className="px-6 py-5 font-medium">
                                                {item.label || "-"}
                                            </td>

                                            <td className="px-6 py-5">
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                                >
                                                    <LinkIcon size={16} />
                                                    Visit Link
                                                </a>
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="rounded-xl bg-slate-100 p-3"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(id)}
                                                        className="rounded-xl bg-red-100 p-3 text-red-600"
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                {editing ? "Edit Archive Link" : "Create Archive Link"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <input
                                type="text"
                                name="label"
                                value={form.label}
                                onChange={handleChange}
                                placeholder="Label"
                                className="w-full rounded-2xl border p-4"
                            />

                            <input
                                type="url"
                                name="url"
                                value={form.url}
                                onChange={handleChange}
                                placeholder="https://example.com"
                                required
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
                                        ? "Update Link"
                                        : "Create Link"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchiveLinks;