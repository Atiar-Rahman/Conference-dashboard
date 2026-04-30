import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    label: "",
    text: "",
    order: 0,
};

const HeroInfo = () => {
    const { conferencePk, heroPk } = useParams();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const endpoint = `/api/v1/conferences/${conferencePk}/hero/${heroPk}/hero-info/`;

    // load data
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

    useEffect(() => {
        if (conferencePk && heroPk) {
            loadItems();
        }
    }, [conferencePk, heroPk]);

    // form change
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "order" ? Number(value) : value,
        }));
    };

    // create
    const openCreate = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(true);
    };

    // edit
    const openEdit = (item) => {
        setEditing(item);
        setForm({
            label: item.label || "",
            text: item.text || "",
            order: item.order ?? 0,
        });
        setShowModal(true);
    };

    // close
    const closeModal = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(false);
    };

    // submit
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
                title: editing ? "Updated" : "Created",
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

    // delete
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this item?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#dc2626",
        });

        if (!result.isConfirmed) return;

        try {
            await apiRequest(`${endpoint}${id}/`, {
                method: "DELETE",
                token,
                csrf: true,
            });

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1000,
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

    return (
        <div className="space-y-5">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Hero Info</h2>
                    <p className="text-sm text-slate-500">
                        Manage hero info cards
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Hero Info
                </button>
            </div>

            {/* table */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No hero info found
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    #
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Label
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Text
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Order
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="border-t hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">{index + 1}</td>

                                    <td className="px-6 py-4 font-medium">
                                        {item.label}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600 max-w-md">
                                        {item.text || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.order}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
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
                )}
            </div>

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-[30px] bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing
                                    ? "Edit Hero Info"
                                    : "Create Hero Info"}
                            </h2>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Label *
                                </label>

                                <input
                                    type="text"
                                    name="label"
                                    value={form.label}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Text
                                </label>

                                <textarea
                                    rows={5}
                                    name="text"
                                    value={form.text}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Order
                                </label>

                                <input
                                    type="number"
                                    name="order"
                                    value={form.order}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
                                />
                            </div>

                            <button
                                disabled={submitLoading}
                                className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
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

export default HeroInfo;