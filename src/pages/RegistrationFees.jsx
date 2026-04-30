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
import { readStoredAuth } from "../lib/authStorage";
import { apiRequest } from "../lib/api";

const CATEGORY_OPTIONS = [
    "student",
    "academic",
    "industry",
    "listener",
];

const PARTICIPANT_OPTIONS = [
    "local",
    "international",
    "virtual",
];

const CURRENCY_OPTIONS = [
    "USD",
    "BDT",
];

const initialForm = {
    title: "",
    category: "",
    participant_type: "",
    amount: "",
    currency: "USD",
    description: "",
};

const RegistrationFees = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const endpoint = "/api/v1/registration-fees/";

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

            const filtered = conferencePk
                ? data.filter((item) => item.conference === conferencePk)
                : data;

            setItems(filtered);
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
            title: item.title || "",
            category: item.category || "",
            participant_type: item.participant_type || "",
            amount: item.amount || "",
            currency: item.currency || "USD",
            description: item.description || "",
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

            const payload = {
                ...form,
                conference: conferencePk,
            };

            if (editing?.id) {
                await apiRequest(`${endpoint}${editing.id}/`, {
                    method: "PATCH",
                    token,
                    csrf: true,
                    body: JSON.stringify(payload),
                });
            } else {
                await apiRequest(endpoint, {
                    method: "POST",
                    token,
                    csrf: true,
                    body: JSON.stringify(payload),
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
            title: "Delete Registration Fee?",
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
                    <h1 className="text-2xl font-bold">Registration Fees</h1>
                    <p className="text-sm text-slate-500">
                        Manage registration fees
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Fee
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
                        No registration fee found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left">Title</th>
                                    <th className="px-5 py-4 text-left">Category</th>
                                    <th className="px-5 py-4 text-left">Participant</th>
                                    <th className="px-5 py-4 text-left">Amount</th>
                                    <th className="px-5 py-4 text-left">Currency</th>
                                    <th className="px-5 py-4 text-left">Description</th>
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
                                            {item.title}
                                        </td>
                                        <td className="px-5 py-4 capitalize">
                                            {item.category}
                                        </td>
                                        <td className="px-5 py-4 capitalize">
                                            {item.participant_type}
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.amount}
                                        </td>
                                        <td className="px-5 py-4">
                                            {item.currency}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                                            {item.description || "-"}
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
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing ? "Edit" : "Create"} Registration Fee
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
                                    Category
                                </label>
                                <select
                                    name="category"
                                    required
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                >
                                    <option value="">Select</option>
                                    {CATEGORY_OPTIONS.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Participant Type
                                </label>
                                <select
                                    name="participant_type"
                                    value={form.participant_type}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                >
                                    <option value="">Select</option>
                                    {PARTICIPANT_OPTIONS.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Currency
                                </label>
                                <select
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                >
                                    {CURRENCY_OPTIONS.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border px-4 py-3"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    disabled={submitLoading}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white"
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

export default RegistrationFees;