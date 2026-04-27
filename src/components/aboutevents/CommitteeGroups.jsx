import { useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Users,
} from "lucide-react";

const initialForm = {
    title: "",
};

const demoData = [
    {
        id: 1,
        title: "Organizing Committee",
    },
    {
        id: 2,
        title: "Technical Program Committee",
    },
];

const CommitteeGroups = () => {
    const [groups, setGroups] = useState(demoData);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

        if (!form.title.trim()) return;

        if (editing) {
            setGroups((prev) =>
                prev.map((item) =>
                    item.id === editing.id
                        ? { ...item, ...form }
                        : item
                )
            );
        } else {
            setGroups((prev) => [
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
        setGroups((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    return (
        <div className="space-y-5">
            {/* header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                        Committee Groups
                    </h2>
                    <p className="text-sm text-slate-500">
                        Manage conference committee groups
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add Group
                </button>
            </div>

            {/* list */}
            <div className="grid gap-4 md:grid-cols-2">
                {groups.map((group) => (
                    <div
                        key={group.id}
                        className="rounded-[24px] border border-slate-200 bg-white p-5"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                    <Users
                                        size={24}
                                        className="text-slate-700"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {group.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Committee group
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        openEdit(group)
                                    }
                                    className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    onClick={() =>
                                        handleDelete(group.id)
                                    }
                                    className="rounded-xl border border-red-200 p-3 text-red-600 transition hover:bg-red-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!groups.length && (
                <div className="rounded-[24px] bg-white p-10 text-center shadow-sm">
                    <Users
                        size={40}
                        className="mx-auto text-slate-300"
                    />

                    <h3 className="mt-4 font-semibold text-slate-900">
                        No committee groups found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Create your first committee group.
                    </p>
                </div>
            )}

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-[30px] bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-slate-900">
                                {editing
                                    ? "Edit Group"
                                    : "Create Group"}
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
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Group title *
                                </label>

                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                                    <Users
                                        size={18}
                                        className="text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Committee title"
                                        className="w-full bg-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <button className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 font-semibold text-white">
                                <Save size={18} />
                                {editing
                                    ? "Update Group"
                                    : "Save Group"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommitteeGroups;