import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    FileText,
    Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../lib/authStorage";
import { apiRequest } from "../lib/api";

const initialForm = {
    title: "",
    image: null,
    description: "",
    deadline: "",
    pdf: null,
};

const CallForPaper = () => {
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const endpoint = "/api/v1/call-for-papers/";

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);

            const res = await apiRequest(endpoint, {
                method: "GET",
                token,
            });

            const data = Array.isArray(res)
                ? res
                : Array.isArray(res?.results)
                    ? res.results
                    : res
                        ? [res]
                        : [];

            setItems(data);
        } catch (err) {
            console.error(err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
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
            title: item.title || "",
            image: null,
            description: item.description || "",
            deadline: item.deadline
                ? item.deadline.slice(0, 16)
                : "",
            pdf: null,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(false);
    };

    const buildFormData = () => {
        const fd = new FormData();

        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("deadline", form.deadline);

        if (form.image instanceof File) {
            fd.append("image", form.image);
        }

        if (form.pdf instanceof File) {
            fd.append("pdf", form.pdf);
        }

        return fd;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitLoading(true);

            const body = buildFormData();

            if (editing?.id) {
                await apiRequest(`${endpoint}${editing.id}/`, {
                    method: "PATCH",
                    token,
                    csrf: true,
                    body,
                });
            } else {
                await apiRequest(endpoint, {
                    method: "POST",
                    token,
                    csrf: true,
                    body,
                });
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
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err.message,
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Call For Paper?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await apiRequest(`${endpoint}${id}/`, {
                method: "DELETE",
                token,
                csrf: true,
            });

            loadItems();

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1000,
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Call For Papers</h1>
                    <p className="text-sm text-slate-500">
                        Manage call for paper content
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add New
                </button>
            </div>

            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No data found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left">Image</th>
                                    <th className="px-5 py-4 text-left">Title</th>
                                    <th className="px-5 py-4 text-left">Deadline</th>
                                    <th className="px-5 py-4 text-left">PDF</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt=""
                                                    className="h-14 w-20 rounded-lg object-cover border"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-slate-100">
                                                    <ImageIcon size={18} />
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 font-medium">
                                            {item.title}
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {new Date(item.deadline).toLocaleString()}
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.pdf ? (
                                                <a
                                                    href={item.pdf}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 text-blue-600"
                                                >
                                                    <FileText size={16} />
                                                    View
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="rounded-xl border p-3 hover:bg-slate-50"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50"
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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing ? "Edit" : "Create"} Call For Paper
                            </h2>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Image
                                </label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    PDF
                                </label>
                                <input
                                    type="file"
                                    name="pdf"
                                    accept=".pdf"
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    rows={5}
                                    name="description"
                                    required
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">
                                    Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    name="deadline"
                                    required
                                    value={form.deadline}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <button
                                    disabled={submitLoading}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {submitLoading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallForPaper;