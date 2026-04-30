import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    Mail,
} from "lucide-react";
import Swal from "sweetalert2";
import { readStoredAuth } from "../lib/authStorage";
import { apiRequest } from "../lib/api";


const initialForm = {
    full_name: "",
    email: "",
    subject: "",
    message: "",
};

const fields = [
    ["Full Name", "full_name", false, true],
    ["Email", "email", false, true],
    ["Subject", "subject", false, true],
    ["Message", "message", true, true],
];

const InputField = ({
    label,
    name,
    value,
    onChange,
    textarea = false,
    required = false,
}) => (
    <div className={textarea ? "md:col-span-2" : ""}>
        <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
        </label>

        {textarea ? (
            <textarea
                rows={5}
                name={name}
                value={value || ""}
                onChange={onChange}
                required={required}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
            />
        ) : (
            <input
                type={name === "email" ? "email" : "text"}
                name={name}
                value={value || ""}
                onChange={onChange}
                required={required}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
            />
        )}
    </div>
);

const Contact = () => {
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const endpoint = "/api/v1/contact/";

    const normalize = (obj) => ({
        full_name: obj.full_name ?? "",
        email: obj.email ?? "",
        subject: obj.subject ?? "",
        message: obj.message ?? "",
    });

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
        loadItems();
    }, []);

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
        setForm(normalize(item));
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

            const payload = normalize(form);

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

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Contact?",
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
        <div className="space-y-5">
            {/* header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Manage contact messages
                </p>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Contact
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
                        No contact found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Name
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Subject
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">
                                        Message
                                    </th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4 font-medium">
                                            {item.full_name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {item.email}
                                        </td>

                                        <td className="px-6 py-4">
                                            {item.subject}
                                        </td>

                                        <td className="px-6 py-4 max-w-sm truncate text-slate-600">
                                            {item.message}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        openEdit(item)
                                                    }
                                                    className="rounded-xl border p-3 hover:bg-slate-100"
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

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing
                                    ? "Edit Contact"
                                    : "Create Contact"}
                            </h2>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            {fields.map(
                                ([label, name, textarea, required]) => (
                                    <InputField
                                        key={name}
                                        label={label}
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        textarea={textarea}
                                        required={required}
                                    />
                                )
                            )}

                            <div className="md:col-span-2">
                                <button
                                    disabled={submitLoading}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {submitLoading
                                        ? "Saving..."
                                        : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contact;