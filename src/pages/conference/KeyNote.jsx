import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    Mic,
    Globe,
    Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    name: "",
    title: "",
    affiliation: "",
    image: null,
    imageAlt: "",
    profile_url: "",
    profileLabel: "Profile",
    order: 0,
};

const KeyNote = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [speakers, setSpeakers] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: initialForm,
    });

    // ================= API =================
    const getSpeakers = () =>
        apiRequest(`/api/v1/conferences/${conferencePk}/keynote/`, {
            method: "GET",
            token,
            csrf: true,
        });

    const createSpeaker = (body) =>
        apiRequest(`/api/v1/conferences/${conferencePk}/keynote/`, {
            method: "POST",
            token,
            csrf: true,
            body, // FormData সরাসরি
        });

    const updateSpeaker = (id, body) =>
        apiRequest(`/api/v1/conferences/${conferencePk}/keynote/${id}/`, {
            method: "PATCH",
            token,
            csrf: true,
            body, // FormData সরাসরি
        });

    const deleteSpeaker = (id) =>
        apiRequest(`/api/v1/conferences/${conferencePk}/keynote/${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

    // ================= LOAD =================
    const loadSpeakers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getSpeakers();

            const items = Array.isArray(data)
                ? data
                : data?.results
                    ? data.results
                    : data
                        ? [data]
                        : [];

            setSpeakers(items);
        } catch (err) {
            setError(err.message);
            setSpeakers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) loadSpeakers();
    }, [conferencePk]);

    // ================= MODAL =================
    const openCreate = () => {
        setEditing(null);
        reset(initialForm);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);

        reset({
            name: item.name || "",
            title: item.title || "",
            affiliation: item.affiliation || "",
            image: null,
            imageAlt: item.imageAlt || "",
            profile_url: item.profile_url || "",
            profileLabel: item.profileLabel || "Profile",
            order: item.order || 0,
        });

        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        reset(initialForm);
        setShowModal(false);
    };

    // ================= SUBMIT =================
    const onSubmit = async (data) => {
        try {
            setSubmitLoading(true);
            setError("");

            const formData = new FormData();

            formData.append("name", data.name);
            formData.append("title", data.title);
            formData.append("affiliation", data.affiliation);
            formData.append("imageAlt", data.imageAlt);
            formData.append("profile_url", data.profile_url || "");
            formData.append("profileLabel", data.profileLabel || "Profile");
            formData.append("order", data.order || 0);

            if (data.image?.[0]) {
                formData.append("image", data.image[0]);
            }

            const id = editing?.id || editing?.pk;

            if (id) {
                await updateSpeaker(id, formData);
            } else {
                await createSpeaker(formData);
            }

            closeModal();
            loadSpeakers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete keynote speaker?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteSpeaker(id);

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1500,
                showConfirmButton: false,
            });

            loadSpeakers();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Keynote Speakers</h2>
                    <p className="text-sm text-slate-500">
                        Manage keynote speakers
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Add Speaker
                </button>
            </div>

            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {/* table */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center gap-3 py-20">
                        <Loader2 className="animate-spin" />
                        Loading...
                    </div>
                ) : !speakers.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No keynote speaker found
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left">Speaker</th>
                                <th className="px-6 py-4 text-left">Title</th>
                                <th className="px-6 py-4 text-left">Affiliation</th>
                                <th className="px-6 py-4 text-left">Profile</th>
                                <th className="px-6 py-4 text-left">Order</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {speakers.map((item) => {
                                const id = item.id || item.pk;

                                return (
                                    <tr key={id} className="border-b hover:bg-slate-50">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.imageAlt}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100">
                                                        <Mic size={18} />
                                                    </div>
                                                )}

                                                <span className="font-medium">{item.name}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5">{item.title}</td>
                                        <td className="px-6 py-5">{item.affiliation}</td>

                                        <td className="px-6 py-5">
                                            {item.profile_url ? (
                                                <a
                                                    href={item.profile_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 text-blue-600"
                                                >
                                                    <Globe size={15} />
                                                    {item.profileLabel}
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        <td className="px-6 py-5">{item.order}</td>

                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
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
                )}
            </div>

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex justify-between">
                            <h3 className="text-2xl font-semibold">
                                {editing ? "Update Speaker" : "Create Speaker"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <input {...register("name", { required: true })} placeholder="Name" className="rounded-2xl border p-4" />
                            <input {...register("title", { required: true })} placeholder="Title" className="rounded-2xl border p-4" />
                            <input {...register("affiliation", { required: true })} placeholder="Affiliation" className="rounded-2xl border p-4" />
                            <input {...register("imageAlt", { required: true })} placeholder="Image alt" className="rounded-2xl border p-4" />
                            <input {...register("profile_url")} placeholder="Profile URL" className="rounded-2xl border p-4" />
                            <input {...register("profileLabel")} placeholder="Profile Label" className="rounded-2xl border p-4" />
                            <input type="number" {...register("order")} placeholder="Order" className="rounded-2xl border p-4" />
                            <input type="file" {...register("image")} className="rounded-2xl border p-4 md:col-span-2" />

                            <button
                                disabled={submitLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black py-4 text-white md:col-span-2"
                            >
                                <Save size={18} />
                                {submitLoading ? "Saving..." : editing ? "Update Speaker" : "Create Speaker"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeyNote;