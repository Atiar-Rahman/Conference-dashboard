import { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    status: "pending",
};

const statusOptions = ["pending", "approved", "rejected"];

const Register = () => {
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [registers, setRegisters] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/register/`;

    // ================= API =================
    const getRegisters = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
            csrf: true,
        });

    const createRegister = (payload) =>
        apiRequest(endpoint, {
            method: "POST",
            token,
            csrf: true,
            body: JSON.stringify({
                status: payload.status,
            }),
        });

    const updateRegister = async (id, payload) => {
        const url = `${endpoint}${id}/`;

        try {
            return await apiRequest(url, {
                method: "PATCH",
                token,
                csrf: true,
                body: JSON.stringify({
                    status: payload.status,
                }),
            });
        } catch (err) {
            if (err.status !== 405) throw err;

            return apiRequest(url, {
                method: "PUT",
                token,
                csrf: true,
                body: JSON.stringify({
                    status: payload.status,
                }),
            });
        }
    };

    const deleteRegister = (id) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

    // ================= LOAD =================
    const loadRegisters = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await getRegisters();

            const items = Array.isArray(res)
                ? res
                : res?.results || [];

            setRegisters(items);
        } catch (err) {
            console.log(err);
            setError(err.message);
            setRegisters([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) loadRegisters();
    }, [conferencePk]);

    // ================= FORM =================
    const openCreate = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            status: item.status || "pending",
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

            if (editing?.id) {
                await updateRegister(editing.id, form);

                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await createRegister(form);

                Swal.fire({
                    icon: "success",
                    title: "Created",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }

            closeModal();
            loadRegisters();
        } catch (err) {
            setError(err.message);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message,
            });
        } finally {
            setSubmitLoading(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
        });

        if (!result.isConfirmed) return;

        try {
            await deleteRegister(id);

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1500,
                showConfirmButton: false,
            });

            loadRegisters();
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message,
            });
        }
    };

    const badgeColor = (status) => {
        if (status === "approved")
            return "bg-green-100 text-green-700";
        if (status === "rejected")
            return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700";
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">
                        Registration
                    </h2>
                    <p className="text-sm text-slate-500">
                        Manage registrations
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="rounded-2xl bg-black px-5 py-3 text-white flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Registration
                </button>
            </div>

            {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-red-600">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border bg-white">
                {loading ? (
                    <div className="py-20 flex justify-center gap-3">
                        <Loader2 className="animate-spin" />
                        Loading...
                    </div>
                ) : !registers.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No registration found
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left">ID</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Created</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {registers.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">
                                        {item.id}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm capitalize ${badgeColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        {new Date(
                                            item.created_at
                                        ).toLocaleString()}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    openEdit(item)
                                                }
                                                className="p-3 rounded-xl bg-slate-100"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                                className="p-3 rounded-xl bg-red-100 text-red-600"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
                    <div className="w-full max-w-xl rounded-3xl bg-white p-8">
                        <div className="flex justify-between mb-6">
                            <h3 className="text-xl font-semibold">
                                {editing
                                    ? "Edit Registration"
                                    : "Create Registration"}
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
                                value={form.status}
                                onChange={(e) =>
                                    setForm({
                                        status: e.target.value,
                                    })
                                }
                                className="w-full border rounded-2xl p-4"
                            >
                                {statusOptions.map((s) => (
                                    <option
                                        key={s}
                                        value={s}
                                    >
                                        {s}
                                    </option>
                                ))}
                            </select>

                            <button
                                disabled={submitLoading}
                                className="w-full rounded-2xl bg-black py-4 text-white flex justify-center gap-2"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : "Save"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;