import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    Users,
    ClipboardCheck,
    RefreshCcw,
    FileText,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    title: "",
    abstract: "",
    keywords: "",
    pdf: null,
};

const Paper = () => {
    const { conferencePk, trackPk } = useParams();
    const navigate = useNavigate();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/track/${trackPk}/papers/`;

    // Build FormData
    const buildPayload = () => {
        const fd = new FormData();

        fd.append("title", form.title);
        fd.append("abstract", form.abstract);
        fd.append("keywords", form.keywords);

        if (form.pdf) {
            fd.append("pdf", form.pdf);
        }

        return fd;
    };

    // API
    const getItems = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
            csrf: true,
        });

    const createItem = () =>
        apiRequest(endpoint, {
            method: "POST",
            token,
            csrf: true,
            body: buildPayload(),
        });

    const updateItem = (id) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "PATCH",
            token,
            csrf: true,
            body: buildPayload(),
        });

    const deleteItem = (id) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

    // Load
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
        if (conferencePk && trackPk) {
            loadItems();
        }
    }, [conferencePk, trackPk]);

    // Form
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
            abstract: item.abstract || "",
            keywords: item.keywords || "",
            pdf: null,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(false);
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();


        try {
            setSubmitLoading(true);

            const id = editing?.id || editing?.pk;

            if (id) {
                await updateItem(id);

                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    timer: 1200,
                    showConfirmButton: false,
                });
            } else {
                await createItem();

                Swal.fire({
                    icon: "success",
                    title: "Created",
                    timer: 1200,
                    showConfirmButton: false,
                });
            }

            console.log(id)

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
    console.log(items)
    // Delete
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete paper?",
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

    // Navigate
    const openCoAuthor = (id) => {
        navigate(
            `/conference/${conferencePk}/track/${trackPk}/papers/${id}/co-author`
        );
    };

    const openReview = (id) => {
        navigate(
            `/conference/${conferencePk}/track/${trackPk}/papers/${id}/review-assign`
        );
    };

    const openStatus = (id) => {
        navigate(
            `/conference/${conferencePk}/track/${trackPk}/papers/${id}/status-update`
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Papers</h2>
                    <p className="text-sm text-slate-500">
                        Manage conference papers
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Add Paper
                </button>
            </div>

            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20">
                        <Loader2 className="animate-spin" />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No paper found
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full min-w-[1100px]">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">Title</th>
                                    <th className="px-6 py-4 text-left">Author</th>
                                    <th className="px-6 py-4 text-left">Keywords</th>
                                    <th className="px-6 py-4 text-left">PDF</th>
                                    <th className="px-6 py-4 text-left">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => {
                                    const id = item.id || item.pk;

                                    return (
                                        <tr
                                            key={id}
                                            className="border-b hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-5 font-medium">
                                                {item.title}
                                            </td>

                                            <td className="px-6 py-5">
                                                {item.author?.email || "-"}
                                            </td>

                                            <td className="px-6 py-5">
                                                {item.keywords}
                                            </td>

                                            <td className="px-6 py-5">
                                                {item.pdf ? (
                                                    <a
                                                        href={item.pdf}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                                                    >
                                                        <FileText size={16} />
                                                        View
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="px-6 py-5 capitalize">
                                                {item.status || "-"}
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => openCoAuthor(id)}
                                                        className="rounded-xl bg-blue-100 px-4 py-2 text-blue-700"
                                                    >
                                                        <Users size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => openReview(id)}
                                                        className="rounded-xl bg-emerald-100 px-4 py-2 text-emerald-700"
                                                    >
                                                        <ClipboardCheck size={15} />
                                                    </button>

                                                    <button
                                                        onClick={() => openStatus(id)}
                                                        className="rounded-xl bg-purple-100 px-4 py-2 text-purple-700"
                                                    >
                                                        <RefreshCcw size={15} />
                                                    </button>

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

            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                {editing ? "Update Paper" : "Create Paper"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Paper title"
                                required
                                className="w-full rounded-2xl border p-4"
                            />

                            <textarea
                                name="abstract"
                                value={form.abstract}
                                onChange={handleChange}
                                placeholder="Abstract"
                                rows={5}
                                required
                                className="w-full rounded-2xl border p-4"
                            />

                            <input
                                name="keywords"
                                value={form.keywords}
                                onChange={handleChange}
                                placeholder="keywords"
                                required
                                className="w-full rounded-2xl border p-4"
                            />

                            <input
                                type="file"
                                name="pdf"
                                accept=".pdf"
                                onChange={handleChange}
                                className="w-full rounded-2xl border p-4"
                            />

                            <button
                                disabled={submitLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-white"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Paper"
                                        : "Create Paper"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Paper;