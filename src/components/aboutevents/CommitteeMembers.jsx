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
    name: "",
    designation: "",
    description: "",
    affiliation: "",
    order: 0,
    image: null,
};

const CommitteeMembers = () => {
    const { conferencePk, groupPk } = useParams();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = `/api/v1/conferences/${conferencePk}/committee-group/${groupPk}/group-member/`;

    const buildPayload = () => {
        const fd = new FormData();

        fd.append("name", form.name);
        fd.append("designation", form.designation);
        fd.append("description", form.description);
        fd.append("affiliation", form.affiliation);
        fd.append("order", form.order);

        if (form.image) {
            fd.append("image", form.image);
        }

        return fd;
    };

    const getItems = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
            csrf: true,
        });

    const createItem = () =>
        apiRequest(endpoint, {
            method: "POST",
            token,
            csrf: true,
            body: buildPayload(),
        });

    const updateItem = (id) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "PATCH",
            token,
            csrf: true,
            body: buildPayload(),
        });

    const deleteItem = (id) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

    const loadItems = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getItems();

            const parsed = Array.isArray(data)
                ? data
                : data?.results
                    ? data.results
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
        if (conferencePk && groupPk) loadItems();
    }, [conferencePk, groupPk]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
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
            designation: item.designation || "",
            description: item.description || "",
            affiliation: item.affiliation || "",
            order: item.order || 0,
            image: null,
        });

        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitLoading(true);

            const id = editing?.id;

            if (id) {
                await updateItem(id);
            } else {
                await createItem();
            }

            Swal.fire({
                icon: "success",
                title: editing ? "Updated" : "Created",
                timer: 1200,
                showConfirmButton: false,
            });

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

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete member?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Delete",
        });

        if (!result.isConfirmed) return;

        await deleteItem(id);
        loadItems();
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Committee Members</h2>
                    <p className="text-sm text-slate-500">
                        Manage committee group members
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Add Member
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-600">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No committee member found
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">Name</th>
                                    <th className="px-6 py-4 text-left">Designation</th>
                                    <th className="px-6 py-4 text-left">Affiliation</th>
                                    <th className="px-6 py-4 text-left">Description</th>
                                    <th className="px-6 py-4 text-left">Order</th>
                                    <th className="px-6 py-4 text-right">Action</th>
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
                                                {item.name}
                                            </td>

                                            <td className="px-6 py-5">
                                                {item.designation || "-"}
                                            </td>

                                            <td className="px-6 py-5">
                                                {item.affiliation || "-"}
                                            </td>

                                            <td className="px-6 py-5 max-w-sm truncate">
                                                {item.description || "-"}
                                            </td>

                                            <td className="px-6 py-5">
                                                {item.order}
                                            </td>

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
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">
                                {editing ? "Update Member" : "Create Member"}
                            </h3>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Name"
                                required
                                className="w-full rounded-2xl border p-4"
                            />

                            <input
                                type="text"
                                name="designation"
                                value={form.designation}
                                onChange={handleChange}
                                placeholder="Designation"
                                className="w-full rounded-2xl border p-4"
                            />

                            <input
                                type="text"
                                name="affiliation"
                                value={form.affiliation}
                                onChange={handleChange}
                                placeholder="Affiliation"
                                className="w-full rounded-2xl border p-4"
                            />

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Description"
                                className="w-full rounded-2xl border p-4"
                            />

                            <input
                                type="number"
                                name="order"
                                value={form.order}
                                onChange={handleChange}
                                placeholder="Order"
                                className="w-full rounded-2xl border p-4"
                            />

                            <button
                                disabled={submitLoading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-white disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading
                                    ? "Saving..."
                                    : editing
                                        ? "Update Member"
                                        : "Create Member"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommitteeMembers;