import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    PlayCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { apiRequest } from "../lib/api";
import { readStoredAuth } from "../lib/authStorage";

const initialForm = {
    heading: "",
    title: "",
    description: "",
    name: "",
    video_url: "",
};

const VideoSessions = () => {
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const endpoint = "/api/v1/videosessions/";

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
            heading: item.heading || "",
            title: item.title || "",
            description: item.description || "",
            name: item.name || "",
            video_url: item.video_url || "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitLoading(true);

            if (editing?.id) {
                await apiRequest(`${endpoint}${editing.id}/`, {
                    method: "PATCH",
                    token,
                    csrf: true,
                    body: JSON.stringify(form),
                });
            } else {
                await apiRequest(endpoint, {
                    method: "POST",
                    token,
                    csrf: true,
                    body: JSON.stringify(form),
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
            title: "Delete Video Session?",
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
                    <h1 className="text-2xl font-bold">Video Sessions</h1>
                    <p className="text-sm text-slate-500">
                        Manage conference video sessions
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Video
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
                        No video session found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left">Heading</th>
                                    <th className="px-5 py-4 text-left">Title</th>
                                    <th className="px-5 py-4 text-left">Description</th>
                                    <th className="px-5 py-4 text-left">Speaker</th>
                                    <th className="px-5 py-4 text-left">Video</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4 font-medium">
                                            {item.heading}
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.title}
                                        </td>

                                        <td className="px-5 py-4 max-w-sm truncate text-slate-600">
                                            {item.description}
                                        </td>

                                        <td className="px-5 py-4">
                                            {item.name || "-"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <a
                                                href={item.video_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-red-700"
                                            >
                                                <PlayCircle size={16} />
                                                Watch
                                            </a>
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
                    <div className="w-full max-w-4xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing ? "Edit Video Session" : "Create Video Session"}
                            </h2>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Heading *
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="heading"
                                    value={form.heading}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">
                                    Description *
                                </label>
                                <textarea
                                    rows={5}
                                    required
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Speaker Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Video URL *
                                </label>
                                <input
                                    type="url"
                                    required
                                    name="video_url"
                                    value={form.video_url}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    disabled={submitLoading}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-60"
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

export default VideoSessions;