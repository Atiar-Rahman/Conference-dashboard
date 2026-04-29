import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Pencil,
    Save,
    X,
    Loader2,
    RefreshCcw,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const STATUS_OPTIONS = [
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
];

const StatusUpdate = () => {
    const { conferencePk, trackPk, paperPk } = useParams();
    const token = readStoredAuth()?.access;

    const [item, setItem] = useState(null);
    const [form, setForm] = useState({
        status: "",
    });

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/track/${trackPk}/papers/${paperPk}/status-update/`;

    const getItem = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
            csrf: true,
        });

    const updateItem = (id, payload) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "PATCH",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });

    const loadItem = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getItem();

            const parsed = Array.isArray(data)
                ? data[0]
                : data?.results
                    ? data.results[0]
                    : data;

            setItem(parsed || null);

            if (parsed) {
                setForm({
                    status: parsed.status || "",
                });
            }
        } catch (err) {
            setError(err.message);
            setItem(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk && trackPk && paperPk) {
            loadItem();
        }
    }, [conferencePk, trackPk, paperPk]);

    const openEdit = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        setForm({
            status: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!item?.id) return;

        try {
            setSubmitLoading(true);

            await updateItem(item.id, form);

            Swal.fire({
                icon: "success",
                title: "Updated",
                text: "Paper status updated successfully",
                timer: 1200,
                showConfirmButton: false,
            });

            closeModal();
            loadItem();
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Paper Status</h2>
                    <p className="text-sm text-slate-500">
                        Update paper review status
                    </p>
                </div>

                {item && (
                    <button
                        onClick={openEdit}
                        className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                    >
                        <Pencil size={18} />
                        Update Status
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {/* Card */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !item ? (
                    <div className="py-20 text-center text-slate-500">
                        No status found
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-2xl border p-6">
                                <p className="text-sm text-slate-500 mb-2">
                                    Current Status
                                </p>

                                <div className="inline-flex items-center gap-2 rounded-xl bg-purple-100 px-4 py-2 text-purple-700 capitalize font-medium">
                                    <RefreshCcw size={16} />
                                    {item.status.replace("_", " ")}
                                </div>
                            </div>

                            <div className="rounded-2xl border p-6">
                                <p className="text-sm text-slate-500 mb-2">
                                    Paper ID
                                </p>

                                <p className="font-medium break-all">
                                    {item.paper}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                Update Status
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                required
                                className="w-full rounded-2xl border p-4"
                            >
                                <option value="">Select status</option>

                                {STATUS_OPTIONS.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
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
                                    : "Update Status"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusUpdate;