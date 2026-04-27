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
    Building2,
    User,
} from "lucide-react";
import { readStoredAuth } from "../../lib/authStorage";

const initialForm = {
    name: "",
    role: "",
    organization: "",
    phone: "",
    cell: "",
    email: "",
    cta_label: "",
};

const ContactInfos = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [contact, setContact] = useState(null);
    const [editing, setEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/contact-info/`;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: initialForm,
    });

    // GET
    const loadContact = async () => {
        if (!conferencePk || !token) return;

        try {
            setLoading(true);
            setError("");

            const res = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            // no contact yet
            if (res.status === 404) {
                setContact(null);
                return;
            }

            if (!res.ok) throw new Error("Failed to load contact");

            const data = await res.json();
            setContact(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContact();
    }, [conferencePk, token]);

    // create modal
    const openCreate = () => {
        setEditing(false);
        reset(initialForm);
        setShowModal(true);
        setError("");
    };

    // edit modal
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
        setError("");
    };

    const closeModal = () => {
        setEditing(false);
        setShowModal(false);
        reset(initialForm);
        setError("");
    };

    // CREATE / UPDATE
    const onSubmit = async (formData) => {
        try {
            setSubmitLoading(true);
            setError("");

            const url = editing ? `${endpoint}${contact.id}/` : endpoint;

            const res = await fetch(url, {
                method: editing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(
                    data?.detail ||
                    Object.values(data || {}).flat().join(", ") ||
                    "Save failed"
                );
            }

            closeModal();
            loadContact();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    // DELETE
    const handleDelete = async () => {
        if (!contact) return;
        if (!window.confirm("Delete this contact?")) return;

        try {
            const res = await fetch(`${endpoint}${contact.id}/`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Delete failed");

            setContact(null);
        } catch (err) {
            setError(err.message);
        }
    };

    if (!conferencePk) {
        return (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
                Conference ID missing
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Contact Info</h2>

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

            {loading ? (
                <div className="rounded-3xl bg-white p-10 text-center">
                    <Loader2 className="mx-auto animate-spin" />
                </div>
            ) : !contact ? (
                <div className="rounded-3xl bg-white p-10 text-center shadow">
                    No contact found
                </div>
            ) : (
                <div className="rounded-3xl bg-white p-6 shadow">
                    <div className="flex justify-between">
                        <div className="space-y-3">
                            <p className="flex items-center gap-2 text-lg font-semibold">
                                <User size={18} />
                                {contact.name}
                            </p>

                            <p>
                                {contact.role} • {contact.organization}
                            </p>

                            <p className="flex items-center gap-2">
                                <Phone size={16} />
                                {contact.phone || "-"}
                            </p>

                            <p>{contact.cell || "-"}</p>

                            <p className="flex items-center gap-2">
                                <Mail size={16} />
                                {contact.email}
                            </p>

                            <p className="flex items-center gap-2">
                                <Building2 size={16} />
                                {contact.cta_label}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={openEdit}>
                                <Pencil size={18} />
                            </button>

                            <button onClick={handleDelete}>
                                <Trash2 size={18} className="text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-500">
                    {error}
                </p>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-6">
                        <div className="mb-5 flex justify-between">
                            <h3 className="text-xl font-semibold">
                                {editing ? "Edit Contact" : "Create Contact"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <input
                                {...register("name", { required: "Name required" })}
                                placeholder="Name"
                                className="rounded-2xl border px-4 py-3"
                            />

                            <input
                                {...register("role", { required: "Role required" })}
                                placeholder="Role"
                                className="rounded-2xl border px-4 py-3"
                            />

                            <input
                                {...register("organization", {
                                    required: "Organization required",
                                })}
                                placeholder="Organization"
                                className="rounded-2xl border px-4 py-3"
                            />

                            <input
                                {...register("phone")}
                                placeholder="Phone"
                                className="rounded-2xl border px-4 py-3"
                            />

                            <input
                                {...register("cell")}
                                placeholder="Cell"
                                className="rounded-2xl border px-4 py-3"
                            />

                            <input
                                type="email"
                                {...register("email", { required: "Email required" })}
                                placeholder="Email"
                                className="rounded-2xl border px-4 py-3"
                            />

                            <input
                                {...register("cta_label", {
                                    required: "CTA Label required",
                                })}
                                placeholder="CTA Label"
                                className="rounded-2xl border px-4 py-3 md:col-span-2"
                            />

                            {Object.values(errors).length > 0 && (
                                <p className="text-sm text-red-500 md:col-span-2">
                                    {Object.values(errors)[0]?.message}
                                </p>
                            )}

                            <button
                                disabled={submitLoading}
                                className="rounded-2xl bg-black py-3 text-white md:col-span-2"
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
};

export default ContactInfos;