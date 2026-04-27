import { useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Calendar,
    FileText,
} from "lucide-react";

const initialForm = {
    year: "",
    title: "",
    description: "",
};

const demoArchives = [
    {
        id: 1,
        year: 2025,
        title: "DUET Conference 2025",
        description: "Conference archive with proceedings and reports.",
    },
];

const Archives = () => {
    const [archives, setArchives] = useState(demoArchives);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(initialForm);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const openCreate = () => {
        setEditing(null);
        setForm(initialForm);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm(item);
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.year || !form.title) return;

        if (editing) {
            setArchives((prev) =>
                prev.map((item) =>
                    item.id === editing.id
                        ? {
                            ...item,
                            ...form,
                        }
                        : item
                )
            );
        } else {
            setArchives((prev) => [
                {
                    id: Date.now(),
                    ...form,
                },
                ...prev,
            ]);
        }

        setShowModal(false);
    };

    const handleDelete = (id) => {
        setArchives((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    return (
        <div className="space-y-5">
            {/* top */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Archives
                    </h2>
                    <p className="text-sm text-slate-500">
                        Manage conference archive records
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Archive
                </button>
            </div>

            {/* list */}
            <div className="space-y-4">
                {archives.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-[24px] border border-slate-200 bg-white p-6"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                    <Calendar size={15} />
                                    {item.year}
                                </div>

                                <h3 className="text-xl font-semibold text-slate-900">
                                    {item.title}
                                </h3>

                                {item.description && (
                                    <p className="mt-2 text-sm leading-7 text-slate-500">
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        openEdit(item)
                                    }
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
                        </div>
                    </div>
                ))}
            </div>

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-[30px] bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-slate-900">
                                {editing
                                    ? "Edit Archive"
                                    : "Create Archive"}
                            </h2>

                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                                className="rounded-xl p-2 hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {/* year */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Year *
                                </label>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                                    <Calendar
                                        size={18}
                                        className="text-slate-400"
                                    />

                                    <input
                                        type="number"
                                        name="year"
                                        required
                                        value={form.year}
                                        onChange={handleChange}
                                        placeholder="2026"
                                        className="w-full bg-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* title */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Title *
                                </label>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                                    <FileText
                                        size={18}
                                        className="text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Archive title"
                                        className="w-full bg-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {/* description */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Description
                                </label>

                                <textarea
                                    rows={5}
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Archive details..."
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                                />
                            </div>

                            <button className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 font-semibold text-white">
                                <Save size={18} />
                                {editing
                                    ? "Update Archive"
                                    : "Save Archive"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Archives;