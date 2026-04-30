import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    label: "",
    image: null,
};

const HeroImage = () => {
    const { conferencePk, heroPk } = useParams();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const endpoint = `/api/v1/conferences/${conferencePk}/hero/${heroPk}/hero-image/`;

    // load
    const loadItems = async () => {
        try {
            setLoading(true);

            const res = await apiRequest(endpoint, {
                method: "GET",
                token,
            });

            const data = Array.isArray(res)
                ? res
                : Array.isArray(res?.results)
                    ? res.results
                    : res
                        ? [res]
                        : [];

            setItems(data);
        } catch (err) {
            console.error(err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk && heroPk) {
            loadItems();
        }
    }, [conferencePk, heroPk]);

    // form
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
            label: item.label ?? "",
            image: null,
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

            const payload = new FormData();
            payload.append("label", form.label || 0);

            if (form.image) {
                payload.append("image", form.image);
            }

            if (editing?.id) {
                await apiRequest(`${endpoint}${editing.id}/`, {
                    method: "PATCH",
                    token,
                    csrf: true,
                    body: payload,
                });
            } else {
                await apiRequest(endpoint, {
                    method: "POST",
                    token,
                    csrf: true,
                    body: payload,
                });
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

    // delete
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this image?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: "#dc2626",
        });

        if (!result.isConfirmed) return;

        try {
            await apiRequest(`${endpoint}${id}/`, {
                method: "DELETE",
                token,
                csrf: true,
            });

            Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1000,
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
        <div className="space-y-5">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Hero Images</h2>
                    <p className="text-sm text-slate-500">
                        Manage hero images
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Image
                </button>
            </div>

            {/* table */}
            <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
                {loading ? (
                    <div className="flex justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No hero image found
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    #
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Preview
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">
                                    Label
                                </th>
                                <th className="px-6 py-4 text-center text-sm font-semibold">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="border-t hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4">{index + 1}</td>

                                    <td className="px-6 py-4">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="h-20 w-28 rounded-xl object-cover border"
                                            />
                                        ) : (
                                            <div className="flex h-20 w-28 items-center justify-center rounded-xl border bg-slate-50 text-slate-400">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 font-medium">
                                        {item.label}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                                            >
                                                <Pencil size={16} />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                                className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50"
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

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-[30px] bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing ? "Edit Hero Image" : "Create Hero Image"}
                            </h2>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Label
                                </label>

                                <input
                                    type="number"
                                    name="label"
                                    value={form.label}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Upload Image
                                </label>

                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                                />

                                {editing?.image && !form.image && (
                                    <img
                                        src={editing.image}
                                        alt=""
                                        className="mt-4 h-32 w-full rounded-2xl border object-cover"
                                    />
                                )}

                                {form.image && (
                                    <img
                                        src={URL.createObjectURL(form.image)}
                                        alt=""
                                        className="mt-4 h-32 w-full rounded-2xl border object-cover"
                                    />
                                )}
                            </div>

                            <button
                                disabled={submitLoading}
                                className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                <Save size={18} />
                                {submitLoading ? "Saving..." : "Save"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeroImage;