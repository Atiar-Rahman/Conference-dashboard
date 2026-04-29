import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
} from "lucide-react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    name: "",
    role: "",
    organization: "",
    phone: "",
    cell: "",
    email: "",
    ctaLabel: "",
};

const ConferenceContact = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [contacts, setContacts] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // ================= API =================
    const getContacts = () =>
        apiRequest(`/api/v1/conferences/${conferencePk}/contact-info/`, {
            method: "GET",
            token,
            csrf: true,
        });

    const createContact = (payload) =>
        apiRequest(`/api/v1/conferences/${conferencePk}/contact-info/`, {
            method: "POST",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });

    const updateContact = (id, payload) =>
        apiRequest(`/api/v1/conferences/${conferencePk}/contact-info/${id}/`, {
            method: "PATCH",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });

    const deleteContact = (id) =>
        apiRequest(`/api/v1/conferences/${conferencePk}/contact-info/${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

    // ================= LOAD =================
    const loadContacts = async () => {
        try {
            setLoading(true);

            const data = await getContacts();

            const items = Array.isArray(data)
                ? data
                : data?.results
                    ? data.results
                    : data
                        ? [data]
                        : [];

            setContacts(items);
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) loadContacts();
    }, [conferencePk]);

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
            name: item.name || "",
            role: item.role || "",
            organization: item.organization || "",
            phone: item.phone || "",
            cell: item.cell || "",
            email: item.email || "",
            ctaLabel: item.ctaLabel || "",
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
                await updateContact(id, form);

                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Contact updated successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createContact(form);

                Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: "Contact created successfully.",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }

            closeModal();
            loadContacts();
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Contact?",
            text: "You won't be able to revert this.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteContact(id);

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Contact deleted successfully.",
                timer: 1500,
                showConfirmButton: false,
            });

            loadContacts();
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        }
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Conference Contact</h2>
                    <p className="text-sm text-slate-500">
                        Manage conference contact information
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Add Contact
                </button>
            </div>

            {/* table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
                        <Loader2 className="animate-spin" />
                        Loading...
                    </div>
                ) : !contacts.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No contact found
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left">Name</th>
                                <th className="px-6 py-4 text-left">Role</th>
                                <th className="px-6 py-4 text-left">Organization</th>
                                <th className="px-6 py-4 text-left">Phone</th>
                                <th className="px-6 py-4 text-left">Email</th>
                                <th className="px-6 py-4 text-left">CTA</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {contacts.map((contact) => {
                                const id = contact.id || contact.pk;

                                return (
                                    <tr key={id} className="border-b hover:bg-slate-50">
                                        <td className="px-6 py-5 font-medium">{contact.name}</td>
                                        <td className="px-6 py-5">{contact.role}</td>
                                        <td className="px-6 py-5">{contact.organization}</td>
                                        <td className="px-6 py-5">
                                            {contact.phone || "-"} / {contact.cell || "-"}
                                        </td>
                                        <td className="px-6 py-5">{contact.email}</td>
                                        <td className="px-6 py-5">{contact.ctaLabel}</td>

                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(contact)}
                                                    className="rounded-xl bg-slate-100 p-3 hover:bg-slate-200"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(id)}
                                                    className="rounded-xl bg-red-100 p-3 text-red-600 hover:bg-red-200"
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
                )}
            </div>

            {/* modal */}
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
                            onSubmit={handleSubmit}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="rounded-2xl border p-4" />
                            <input name="role" value={form.role} onChange={handleChange} placeholder="Role" required className="rounded-2xl border p-4" />
                            <input name="organization" value={form.organization} onChange={handleChange} placeholder="Organization" required className="rounded-2xl border p-4" />
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="rounded-2xl border p-4" />
                            <input name="cell" value={form.cell} onChange={handleChange} placeholder="Cell" className="rounded-2xl border p-4" />
                            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required className="rounded-2xl border p-4" />
                            <input name="ctaLabel" value={form.ctaLabel} onChange={handleChange} placeholder="CTA Label" required className="rounded-2xl border p-4 md:col-span-2" />

                            <button
                                disabled={submitLoading}
                                className="rounded-2xl bg-black py-4 text-white md:col-span-2"
                            >
                                <Save size={18} className="inline mr-2" />
                                {submitLoading ? "Saving..." : editing ? "Update Contact" : "Save Contact"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConferenceContact;