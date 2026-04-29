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
    FileText,
    Calendar,
    Link as LinkIcon,
    Type,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    eyebrow: "",
    pretitle: "",
    title: "",
    date_line: "",
    summary: "",
    cta_primary_label: "",
    cta_primary_link: "",
    cta_secondary_label: "",
    cta_secondary_link: "",
};

const Hero = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [heroes, setHeroes] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: initialForm,
    });

    // ================= API =================
    const getHeroes = async () => {
        return apiRequest(`/api/v1/conferences/${conferencePk}/hero/`, {
            method: "GET",
            token,
            csrf: true,
        });
    };

    const createHero = async (payload) => {
        return apiRequest(`/api/v1/conferences/${conferencePk}/hero/`, {
            method: "POST",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });
    };

    const updateHero = async (id, payload) => {
        const path = `/api/v1/conferences/${conferencePk}/hero/${id}/`;

        const changedPayload = {};

        if (editing) {
            Object.keys(payload).forEach((key) => {
                if ((payload[key] || "") !== (editing[key] || "")) {
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

    const deleteHero = async (id) => {
        return apiRequest(`/api/v1/conferences/${conferencePk}/hero/${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });
    };

    // ================= LOAD =================
    const loadHeroes = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getHeroes();

            const items = Array.isArray(data)
                ? data
                : data?.results
                    ? data.results
                    : data
                        ? [data]
                        : [];

            setHeroes(items);
        } catch (err) {
            setHeroes([]);
            setError(err.message || "Failed to load hero");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) {
            loadHeroes();
        }
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
            eyebrow: item.eyebrow || "",
            pretitle: item.pretitle || "",
            title: item.title || "",
            date_line: item.date_line || "",
            summary: item.summary || "",
            cta_primary_label: item.cta_primary_label || "",
            cta_primary_link: item.cta_primary_link || "",
            cta_secondary_label: item.cta_secondary_label || "",
            cta_secondary_link: item.cta_secondary_link || "",
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

            if (id) {
                await updateHero(id, formData);

                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Hero updated successfully",
                    timer: 1800,
                    showConfirmButton: false,
                });
            } else {
                await createHero(formData);

                Swal.fire({
                    icon: "success",
                    title: "Created!",
                    text: "Hero created successfully",
                    timer: 1800,
                    showConfirmButton: false,
                });
            }

            closeModal();
            await loadHeroes();
        } catch (err) {
            setError(err.message || "Something went wrong");

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
            title: "Delete Hero?",
            text: "You won't be able to revert this",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteHero(id);
            await loadHeroes();

            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Hero deleted successfully",
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (err) {
            setError(err.message);

            Swal.fire({
                icon: "error",
                title: "Delete failed",
                text: err.message,
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                        Hero Section
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage conference hero section
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Hero
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
                        <Loader2 className="animate-spin" />
                        Loading...
                    </div>
                ) : !heroes.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No hero found
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="px-6 py-4">Eyebrow</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">CTA</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {heroes.map((hero) => {
                                const id = hero.id || hero.pk;

                                return (
                                    <tr key={id} className="border-b hover:bg-slate-50">
                                        <td className="px-6 py-5 font-medium">{hero.eyebrow}</td>
                                        <td className="px-6 py-5">
                                            <p className="font-semibold">{hero.title}</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {hero.pretitle}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">{hero.date_line}</td>
                                        <td className="px-6 py-5 text-sm">
                                            {hero.cta_primary_label || "-"} /{" "}
                                            {hero.cta_secondary_label || "-"}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(hero)}
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
                    <div className="w-full max-w-4xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">
                                {editing ? "Update Hero" : "Create Hero"}
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
                                {...register("eyebrow", { required: true })}
                                placeholder="Eyebrow"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("pretitle", { required: true })}
                                placeholder="Pretitle"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("title", { required: true })}
                                placeholder="Title"
                                className="rounded-2xl border p-4 md:col-span-2"
                            />

                            <input
                                {...register("date_line", { required: true })}
                                placeholder="Date Line"
                                className="rounded-2xl border p-4 md:col-span-2"
                            />

                            <textarea
                                {...register("summary")}
                                rows={4}
                                placeholder="Summary"
                                className="rounded-2xl border p-4 md:col-span-2"
                            />

                            <input
                                {...register("cta_primary_label")}
                                placeholder="Primary CTA Label"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("cta_primary_link")}
                                placeholder="Primary CTA Link"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("cta_secondary_label")}
                                placeholder="Secondary CTA Label"
                                className="rounded-2xl border p-4"
                            />

                            <input
                                {...register("cta_secondary_link")}
                                placeholder="Secondary CTA Link"
                                className="rounded-2xl border p-4"
                            />

                            <button
                                disabled={submitLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black py-4 text-white md:col-span-2 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Hero"
                                        : "Create Hero"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hero;