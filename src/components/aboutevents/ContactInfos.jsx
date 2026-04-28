import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    Phone,
    Mail,
    User,
} from "lucide-react";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    name: "",
    role: "",
    organization: "",
    phone: "",
    cell: "",
    email: "",
    cta_label: "",
};

export default function ContactInfos() {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [contact, setContact] = useState(null);
    const [editing, setEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, reset } = useForm({
        defaultValues: initialForm,
    });

    // ================= API =================
    const getContactInfo = async () => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/contact-info/`,
            {
                method: "GET",
                token,
                csrf: true,
            }
        );
    };

    const createContactInfo = async (payload) => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/contact-info/`,
            {
                method: "POST",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            }
        );
    };

    const updateContactInfo = async (id, payload) => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/contact-info/${id}/`,
            {
                method: "PATCH",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            }
        );
    };

    const deleteContactInfo = async (id) => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/contact-info/${id}/`,
            {
                method: "DELETE",
                token,
                csrf: true,
            }
        );
    };

    // ================= LOAD =================
    const loadContact = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getContactInfo();

            const item = Array.isArray(data)
                ? data[0]
                : data?.results
                    ? data.results[0]
                    : data;

            setContact(item || null);
        } catch (err) {
            setContact(null);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) {
            loadContact();
        }
    }, [conferencePk]);

    // ================= MODAL =================
    const openCreate = () => {
        setEditing(false);
        reset(initialForm);
        setShowModal(true);
    };

    const openEdit = () => {
        if (!contact) return;

        setEditing(true);
        reset({
            name: contact.name || "",
            role: contact.role || "",
            organization: contact.organization || "",
            phone: contact.phone || "",
            cell: contact.cell || "",
            email: contact.email || "",
            cta_label: contact.cta_label || "",
        });

        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(false);
        reset(initialForm);
    };

    // ================= SUBMIT =================
    const onSubmit = async (formData) => {
        try {
            setSubmitLoading(true);
            setError("");

            if (editing && contact?.id) {
                await updateContactInfo(contact.id, formData);
            } else {
                await createContactInfo(formData);
            }

            closeModal();
            loadContact();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async () => {
        if (!contact) return;
        if (!window.confirm("Delete contact?")) return;

        try {
            await deleteContactInfo(contact.id);
            setContact(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Contact Information</h2>
                    <p className="text-sm text-slate-500">
                        Manage conference contact details
                    </p>
                </div>

                {!contact && (
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                    >
                        <Plus size={18} />
                        Add Contact
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center gap-3 py-20">
                        <Loader2 className="animate-spin" />
                        Loading...
                    </div>
                ) : !contact ? (
                    <div className="py-20 text-center text-slate-500">
                        No contact information found
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left">Name</th>
                                <th className="px-6 py-4 text-left">Role</th>
                                <th className="px-6 py-4 text-left">Organization</th>
                                <th className="px-6 py-4 text-left">Contact</th>
                                <th className="px-6 py-4 text-left">CTA</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
                                            <User size={16} />
                                        </div>
                                        {contact.name}
                                    </div>
                                </td>

                                <td className="px-6 py-5">{contact.role}</td>
                                <td className="px-6 py-5">{contact.organization}</td>

                                <td className="px-6 py-5 text-sm">
                                    <p className="flex items-center gap-2">
                                        <Phone size={14} />
                                        {contact.phone || "-"}
                                    </p>
                                    <p className="mt-1 flex items-center gap-2">
                                        <Mail size={14} />
                                        {contact.email}
                                    </p>
                                </td>

                                <td className="px-6 py-5">{contact.cta_label}</td>

                                <td className="px-6 py-5">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={openEdit}
                                            className="rounded-xl bg-slate-100 p-3"
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            onClick={handleDelete}
                                            className="rounded-xl bg-red-100 p-3 text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>

            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex justify-between">
                            <h3 className="text-2xl font-semibold">
                                {editing ? "Update Contact" : "Create Contact"}
                            </h3>
                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <input {...register("name")} placeholder="Name" className="rounded-2xl border p-4" />
                            <input {...register("role")} placeholder="Role" className="rounded-2xl border p-4" />
                            <input {...register("organization")} placeholder="Organization" className="rounded-2xl border p-4" />
                            <input {...register("phone")} placeholder="Phone" className="rounded-2xl border p-4" />
                            <input {...register("cell")} placeholder="Cell" className="rounded-2xl border p-4" />
                            <input {...register("email")} placeholder="Email" className="rounded-2xl border p-4" />
                            <input {...register("cta_label")} placeholder="CTA Label" className="rounded-2xl border p-4 md:col-span-2" />

                            <button
                                disabled={submitLoading}
                                className="rounded-2xl bg-black py-4 text-white md:col-span-2"
                            >
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Contact"
                                        : "Create Contact"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}