import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { apiRequest } from "../lib/api";
import { readStoredAuth } from "../lib/authStorage";



const initialForm = {
    title: "",
    category: "",
    participant_type: "author_participant",
    fee_type: "regular",
    amount: "",
    currency: "USD",
    deadline: "",
    description: "",
    is_deleted: false,
};

const categoryOptions = [
    "student",
    "academic",
    "industry",
    "listener",
];

const participantOptions = [
    "author_participant",
    "co_author",
    "listener",
];

const feeTypeOptions = [
    "early_bird",
    "regular",
    "late",
];

const currencyOptions = ["USD", "BDT"];

const InputField = ({
    label,
    name,
    value,
    onChange,
    type = "text",
    textarea = false,
}) => (
    <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
        </label>

        {textarea ? (
            <textarea
                rows={4}
                name={name}
                value={value || ""}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
            />
        ) : (
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
            />
        )}
    </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
    <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
        </label>

        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
        >
            {options.map((item) => (
                <option key={item} value={item}>
                    {item}
                </option>
            ))}
        </select>
    </div>
);

const RegistrationFeesComponent = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const endpoint = `/api/v1/conferences/${conferencePk}/registration-fees/`;

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
        if (conferencePk) loadItems();
    }, [conferencePk]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
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
            participant_type: item.participant_type || "author_participant",
            fee_type: item.fee_type || "regular",
            amount: item.amount || "",
            currency: item.currency || "USD",
            deadline: item.deadline || "",
            description: item.description || "",
            is_deleted: item.is_deleted || false,
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
            title: "Delete this fee?",
            icon: "warning",
            showCancelButton: true,
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
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Registration Fees</h2>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Fee
                </button>
            </div>

            <div className="overflow-hidden rounded-3xl border bg-white">
                {loading ? (
                    <div className="flex justify-center gap-2 py-20">
                        <Loader2 className="animate-spin" />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No registration fees found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-5 py-4 text-left">Title</th>
                                    <th className="px-5 py-4 text-left">Category</th>
                                    <th className="px-5 py-4 text-left">Participant</th>
                                    <th className="px-5 py-4 text-left">Fee Type</th>
                                    <th className="px-5 py-4 text-left">Amount</th>
                                    <th className="px-5 py-4 text-left">Deadline</th>
                                    <th className="px-5 py-4 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-5 py-4">{item.title}</td>
                                        <td className="px-5 py-4">{item.category}</td>
                                        <td className="px-5 py-4">{item.participant_type}</td>
                                        <td className="px-5 py-4">{item.fee_type}</td>
                                        <td className="px-5 py-4 font-semibold">
                                            {item.amount} {item.currency}
                                        </td>
                                        <td className="px-5 py-4">{item.deadline || "-"}</td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="rounded-xl border p-3"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-xl border border-red-200 p-3 text-red-600"
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
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-8">
                        <div className="mb-6 flex justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing ? "Edit Fee" : "Create Fee"}
                            </h2>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            <InputField
                                label="Title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Amount"
                                name="amount"
                                type="number"
                                value={form.amount}
                                onChange={handleChange}
                            />

                            <SelectField
                                label="Category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                options={categoryOptions}
                            />

                            <SelectField
                                label="Participant Type"
                                name="participant_type"
                                value={form.participant_type}
                                onChange={handleChange}
                                options={participantOptions}
                            />

                            <SelectField
                                label="Fee Type"
                                name="fee_type"
                                value={form.fee_type}
                                onChange={handleChange}
                                options={feeTypeOptions}
                            />

                            <SelectField
                                label="Currency"
                                name="currency"
                                value={form.currency}
                                onChange={handleChange}
                                options={currencyOptions}
                            />

                            <InputField
                                label="Deadline"
                                name="deadline"
                                type="date"
                                value={form.deadline}
                                onChange={handleChange}
                            />

                            <div className="flex items-center gap-3 pt-9">
                                <input
                                    type="checkbox"
                                    name="is_deleted"
                                    checked={form.is_deleted}
                                    onChange={handleChange}
                                />
                                <span>Is Deleted</span>
                            </div>

                            <div className="md:col-span-2">
                                <InputField
                                    label="Description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    textarea
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

export default RegistrationFeesComponent;