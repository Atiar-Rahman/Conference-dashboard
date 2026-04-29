import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Save,
    Loader2,
    User,
    Briefcase,
    Link2,
    Hash,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    name: "",
    title: "",
    affiliation: "",
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

    const { register, handleSubmit, reset } = useForm({
        defaultValues: initialForm,
    });

    // ================= API =================
    const getSpeakers = async () => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/keynote/`,
            {
                method: "GET",
                token,
                csrf: true,
            }
        );
    };

    const createSpeaker = async (payload) => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/keynote/`,
            {
                method: "POST",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            }
        );
    };

    const updateSpeaker = async (id, payload) => {
        const path = `/api/v1/conferences/${conferencePk}/keynote/${id}/`;

        const changedPayload = {};

        if (editing) {
            Object.keys(payload).forEach((key) => {
                if (String(payload[key]) !== String(editing[key] ?? "")) {
                    changedPayload[key] = payload[key];
                }
            });
        }

        const finalPayload =
            Object.keys(changedPayload).length > 0 ? changedPayload : payload;

        try {
            return await apiRequest(path, {
                method: "PATCH",
                token,
                csrf: true,
                body: JSON.stringify(finalPayload),
            });
        } catch (err) {
            if (err?.status !== 405) throw err;

            return apiRequest(path, {
                method: "PUT",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            });
        }
    };

    const deleteSpeaker = async (id) => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/keynote/${id}/`,
            {
                method: "DELETE",
                token,
                csrf: true,
            }
        );
    };

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
            setSpeakers([]);
            setError(err.message);
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
    const onSubmit = async (formData) => {
        try {
            setSubmitLoading(true);
            setError("");

            const id = editing?.id || editing?.pk;

            const payload = {
                ...formData,
                order: Number(formData.order),
            };

            if (id) {
                await updateSpeaker(id, payload);

                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text: "Keynote speaker updated successfully",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createSpeaker(payload);

                Swal.fire({
                    icon: "success",
                    title: "Created",
                    text: "Keynote speaker created successfully",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }

            closeModal();
            await loadSpeakers();
        } catch (err) {
            setError(err.message);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err.message || "Something went wrong",
            });
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
            cancelButtonColor: "#64748b",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteSpeaker(id);

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1200,
                showConfirmButton: false,
            });

            await loadSpeakers();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                        Keynote Speakers
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage conference keynote speakers
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Speaker
                </button>
            </div>

            {/* error */}
            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* table */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={20} />
                        Loading...
                    </div>
                ) : !speakers.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No keynote speakers found
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="px-6 py-4">Speaker</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Affiliation</th>
                                <th className="px-6 py-4">Order</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {speakers.map((item) => {
                                const id = item.id || item.pk;

                                return (
                                    <tr
                                        key={id}
                                        className="border-b last:border-none hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {item.profileLabel || "Profile"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-5 text-slate-700">
                                            {item.title}
                                        </td>

                                        <td className="px-6 py-5 text-slate-600">
                                            {item.affiliation}
                                        </td>

                                        <td className="px-6 py-5">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                                                #{item.order}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
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
                    <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">
                                {editing ? "Edit Speaker" : "Create Speaker"}
                            </h3>

                            <button
                                onClick={closeModal}
                                className="rounded-xl p-2 hover:bg-slate-100"
                            >
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <input
                                {...register("name", { required: true })}
                                placeholder="Speaker name"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("title", { required: true })}
                                placeholder="Title"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("affiliation", { required: true })}
                                placeholder="Affiliation"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("imageAlt", { required: true })}
                                placeholder="Image alt"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("profile_url")}
                                placeholder="Profile URL"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("profileLabel")}
                                placeholder="Profile Label"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                type="number"
                                {...register("order")}
                                placeholder="Order"
                                className="rounded-2xl border p-4 md:col-span-2"
                            />

                            <button
                                disabled={submitLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white md:col-span-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Speaker"
                                        : "Save Speaker"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeyNote;