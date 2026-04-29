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

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    reviewer: "",
};

const ReviewAssign = () => {
    const { conferencePk, trackPk, paperPk } = useParams();
    const token = readStoredAuth()?.access;

    const [reviewers, setReviewers] = useState([]);
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/track/${trackPk}/papers/${paperPk}/review-assign/`;

    // API
    const getReviewers = () =>
        apiRequest("/api/v1/reviewers/", {
            method: "GET",
            token,
            csrf: true,
        });

    const loadReviewers = async () => {
        try {
            const data = await getReviewers();

            const parsed = Array.isArray(data)
                ? data
                : data?.results || [];

            setReviewers(parsed);
        } catch {
            setReviewers([]);
        }
    };
    const getItems = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
            csrf: true,
        });

    const createItem = (payload) =>
        apiRequest(endpoint, {
            method: "POST",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });

    const updateItem = (id, payload) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "PATCH",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });

    const deleteItem = (id) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

    // load
    const loadItems = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getItems();

            const parsed = Array.isArray(data)
                ? data
                : data?.results
                    ? data.results
                    : data
                        ? [data]
                        : [];

            setItems(parsed);
        } catch (err) {
            setError(err.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk && trackPk && paperPk) {
            loadItems();
            loadReviewers();
        }
    }, [conferencePk, trackPk, paperPk]);

    // form
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
            reviewer: item.reviewer?.id || item.reviewer || "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(false);
    };

    // submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitLoading(true);

            const payload = {
                reviewer: form.reviewer,
            };

            const id = editing?.id || editing?.pk;

            if (id) {
                await updateItem(id, payload);

                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text: "Reviewer updated successfully",
                    timer: 1200,
                    showConfirmButton: false,
                });
            } else {
                await createItem(payload);

                Swal.fire({
                    icon: "success",
                    title: "Assigned",
                    text: "Reviewer assigned successfully",
                    timer: 1200,
                    showConfirmButton: false,
                });
            }

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

    // delete
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Remove assignment?",
            text: "This cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteItem(id);

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1200,
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
        <div className="space-y-6">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">
                        Review Assignment
                    </h2>
                    <p className="text-sm text-slate-500">
                        Assign reviewers to paper
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Assign Reviewer
                </button>
            </div>

            {/* error */}
            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {/* table */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                        <Loader2 size={18} className="animate-spin" />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No reviewer assigned
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        Reviewer
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        Assigned At
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => {
                                    const id = item.id || item.pk;

                                    return (
                                        <tr
                                            key={id}
                                            className="border-b hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-5 font-medium">
                                                {item.reviewer?.email ||
                                                    item.reviewer ||
                                                    "-"}
                                            </td>

                                            <td className="px-6 py-5">
                                                {item.assigned_at
                                                    ? new Date(
                                                        item.assigned_at
                                                    ).toLocaleString()
                                                    : "-"}
                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            openEdit(item)
                                                        }
                                                        className="rounded-xl bg-slate-100 p-3"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(id)
                                                        }
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
                    </div>
                )}
            </div>

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                {editing
                                    ? "Update Assignment"
                                    : "Assign Reviewer"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <select
                                name="reviewer"
                                value={form.reviewer}
                                onChange={handleChange}
                                required
                                className="w-full rounded-2xl border p-4"
                            >
                                <option value="">Select reviewer</option>

                                {reviewers.map((reviewer) => (
                                    <option
                                        key={reviewer.id}
                                        value={reviewer.id}
                                    >
                                        {reviewer.first_name} {reviewer.last_name} ({reviewer.email})
                                    </option>
                                ))}
                            </select>

                            <button
                                disabled={submitLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-white disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update"
                                        : "Assign"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewAssign;