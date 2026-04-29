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
    CalendarDays,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    title: "",
    date: "",
};

const ImportantDates = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [dates, setDates] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, reset } = useForm({
        defaultValues: initialForm,
    });

    // ================= API =================
    const getDates = async () => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/important-date/`,
            {
                method: "GET",
                token,
                csrf: true,
            }
        );
    };

    const createDate = async (payload) => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/important-date/`,
            {
                method: "POST",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            }
        );
    };

    const updateDate = async (id, payload) => {
        const path = `/api/v1/conferences/${conferencePk}/important-date/${id}/`;

        const changedPayload = {};

        if (editing) {
            Object.keys(payload).forEach((key) => {
                if (payload[key] !== editing[key]) {
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

    const deleteDate = async (id) => {
        return apiRequest(
            `/api/v1/conferences/${conferencePk}/important-date/${id}/`,
            {
                method: "DELETE",
                token,
                csrf: true,
            }
        );
    };

    // ================= LOAD =================
    const loadDates = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getDates();

            const items = Array.isArray(data)
                ? data
                : data?.results
                    ? data.results
                    : data
                        ? [data]
                        : [];

            setDates(items);
        } catch (err) {
            setDates([]);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) {
            loadDates();
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
            title: item.title || "",
            date: item.date || "",
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
                await updateDate(id, formData);

                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text: "Important date updated successfully",
                    timer: 1800,
                    showConfirmButton: false,
                });
            } else {
                await createDate(formData);

                Swal.fire({
                    icon: "success",
                    title: "Created",
                    text: "Important date created successfully",
                    timer: 1800,
                    showConfirmButton: false,
                });
            }

            closeModal();
            await loadDates();
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
            title: "Delete?",
            text: "This important date will be deleted permanently.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, delete",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteDate(id);

            Swal.fire({
                icon: "success",
                title: "Deleted",
                text: "Deleted successfully",
                timer: 1500,
                showConfirmButton: false,
            });

            await loadDates();
        } catch (err) {
            setError(err.message);

            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err.message || "Delete failed",
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                        Important Dates
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage conference important dates
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Date
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
                ) : !dates.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No important dates found
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="border-b bg-slate-50">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                                <tbody>
                                    {dates?.map((item, index) => {
                                        const id = item.id || item.pk || index;

                                        return (
                                            <tr
                                                key={id}
                                                className="border-b last:border-none hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
                                                            <CalendarDays size={18} />
                                                        </div>

                                                        <span className="font-medium text-slate-900">
                                                            {item?.title || "-"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-slate-600">
                                                    {item?.date
                                                        ? new Date(item.date).toLocaleDateString("en-GB")
                                                        : "-"}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(item)}
                                                            className="rounded-xl bg-slate-100 p-3 hover:bg-slate-200"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
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
                    <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">
                                {editing ? "Edit Important Date" : "Create Important Date"}
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
                            className="space-y-5"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Title *
                                </label>
                                <input
                                    {...register("title", { required: true })}
                                    placeholder="Paper submission deadline"
                                    className="w-full rounded-2xl border p-4 outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    {...register("date", { required: true })}
                                    className="w-full rounded-2xl border p-4 outline-none focus:border-black"
                                />
                            </div>

                            <button
                                disabled={submitLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Date"
                                        : "Save Date"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportantDates;