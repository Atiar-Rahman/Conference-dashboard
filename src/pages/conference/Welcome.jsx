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
import { useParams } from "react-router-dom";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";
import { data } from "autoprefixer";

const initialForm = {
    heading: "",
    conference_name: "",
    theme_title: "",
    theme_intro: "",
    scope_title: "",
    abstract_note_title: "",
    abstract_note: "",
};

const Welcome = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/welcome/`;

    // ================= API =================
    const getItems = async () => {
        return apiRequest(endpoint, {
            method: "GET",
            token,
            csrf: true,
        });
    };

    const createItem = async (payload) => {
        return apiRequest(endpoint, {
            method: "POST",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });
    };

    const updateItem = async (id, payload) => {
        return apiRequest(`${endpoint}${id}/`, {
            method: "PATCH",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });
    };

    const deleteItem = async (id) => {
        return apiRequest(`${endpoint}${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });
    };

    // ================= LOAD =================
    const loadItems = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getItems();

            const parsed = (Array.isArray(data) ? data : data?.results || []).map(item => ({
                ...item,
                conference_name: item.conference_name || item.conferenceName,
                theme_title: item.theme_title || item.themeTitle,
                theme_intro: item.theme_intro || item.themeIntro,
                scope_title: item.scope_title || item.scopeTitle,
                abstract_note_title: item.abstract_note_title || item.abstractNoteTitle,
                abstract_note: item.abstract_note || item.abstractNote,
            }));

            setItems(parsed);
        } catch (err) {
            setError(err.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) {
            loadItems();
        }
    }, [conferencePk]);

    console.log(items)

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
            heading: item.heading || "",
            conference_name: item.conference_name || "",
            theme_title: item.theme_title || "",
            theme_intro: item.theme_intro || "",
            scope_title: item.scope_title || "",
            abstract_note_title: item.abstract_note_title || "",
            abstract_note: item.abstract_note || "",
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
                    text: "Welcome updated successfully",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createItem(form);

                Swal.fire({
                    icon: "success",
                    title: "Created",
                    text: "Welcome created successfully",
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
            title: "Delete this item?",
            text: "You won't be able to undo this.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#dc2626",
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Welcome Section</h2>
                    <p className="text-sm text-slate-500">
                        Manage welcome section content
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Add Welcome
                </button>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No data found
                    </div>
                ) : (
                            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                                <div className="w-full overflow-x-scroll">
                                    <div className="min-w-[1200px]">
                                        <table className="w-full">
                                            <thead className="border-b bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Heading</th>
                                                    <th className="px-4 py-3 text-left">Conference</th>
                                                    <th className="px-4 py-3 text-left">Theme Title</th>
                                                    <th className="px-4 py-3 text-left">Theme Intro</th>
                                                    <th className="px-4 py-3 text-left">Scope</th>
                                                    <th className="px-4 py-3 text-left">Abstract Title</th>
                                                    <th className="px-4 py-3 text-left">Abstract Note</th>
                                                    <th className="px-4 py-3 text-right">Action</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {items.map((item) => {
                                                    const id = item.id || item.pk;

                                                    return (
                                                        <tr key={id} className="border-b hover:bg-slate-50">
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.heading}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.conferenceName || item.conference_name}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.themeTitle || item.theme_title}</td>
                                                            <td className="px-4 py-4 min-w-[300px]">{item.themeIntro || item.theme_intro}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.scopeTitle || item.scope_title}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap">{item.abstractNoteTitle || item.abstract_note_title}</td>
                                                            <td className="px-4 py-4 min-w-[300px]">{item.abstractNote || item.abstract_note}</td>

                                                            <td className="px-4 py-4">
                                                                <div className="flex justify-end gap-2">
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
                                </div>
                            </div>

                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">
                                {editing ? "Edit Welcome" : "Create Welcome"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <input name="heading" value={form.heading} onChange={handleChange} placeholder="Heading" required className="border rounded-xl p-4" />
                            <input name="conference_name" value={form.conference_name} onChange={handleChange} placeholder="Conference Name" required className="border rounded-xl p-4" />
                            <input name="theme_title" value={form.theme_title} onChange={handleChange} placeholder="Theme Title" required className="border rounded-xl p-4 md:col-span-2" />
                            <textarea name="theme_intro" value={form.theme_intro} onChange={handleChange} placeholder="Theme Intro" required rows={4} className="border rounded-xl p-4 md:col-span-2" />
                            <input name="scope_title" value={form.scope_title} onChange={handleChange} placeholder="Scope Title" required className="border rounded-xl p-4 md:col-span-2" />
                            <input name="abstract_note_title" value={form.abstract_note_title} onChange={handleChange} placeholder="Abstract Note Title" required className="border rounded-xl p-4 md:col-span-2" />
                            <textarea name="abstract_note" value={form.abstract_note} onChange={handleChange} placeholder="Abstract Note" required rows={5} className="border rounded-xl p-4 md:col-span-2" />

                            <button
                                disabled={submitLoading}
                                className="flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 text-white md:col-span-2"
                            >
                                <Save size={18} />
                                {submitLoading ? "Saving..." : "Save"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Welcome;