import { useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
} from "lucide-react";

const initialForm = {
    hero_badge: "",
    hero_title: "",
    hero_summary: "",
    submission_process_title: "",
    full_paper_title: "",
    proceedings_title: "",
    venue_title: "",
    submission_path_title: "",
    where_to_submit_title: "",
    indexing_title: "",
    indexing_disclaimer: "",
    sponsors_title: "",
    sponsors_disclaimer: "",
    timeline_title: "",
    fees_title: "",
    fees_summary: "",
    contact_title: "",
};

const demoData = [
    {
        id: 1,
        hero_badge: "DUET 2026",
        hero_title: "International Conference on AI",
        hero_summary: "Conference details and submission guidelines.",
        contact_title: "Contact us",
    },
];

const InputField = ({
    label,
    name,
    value,
    onChange,
    textarea = false,
    required = false,
}) => (
    <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
        </label>

        {textarea ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={4}
                required={required}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
            />
        ) : (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900"
            />
        )}
    </div>
);

const AboutEvents = () => {
    const [items, setItems] = useState(demoData);
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

        if (editing) {
            setItems((prev) =>
                prev.map((item) =>
                    item.id === editing.id
                        ? { ...item, ...form }
                        : item
                )
            );
        } else {
            setItems((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    ...form,
                },
            ]);
        }

        setShowModal(false);
    };

    const handleDelete = (id) => {
        setItems((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    return (
        <div className="space-y-5">
            {/* top */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        Manage about event content
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white"
                >
                    <Plus size={18} />
                    Add About Event
                </button>
            </div>

            {/* list */}
            <div className="space-y-4">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-[24px] border border-slate-200 bg-white p-5"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {item.hero_badge}
                                </span>

                                <h2 className="mt-3 text-xl font-semibold text-slate-900">
                                    {item.hero_title}
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    {item.hero_summary}
                                </p>
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
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-white p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing
                                    ? "Edit About Event"
                                    : "Create About Event"}
                            </h2>

                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            <InputField
                                label="Hero badge"
                                name="hero_badge"
                                value={form.hero_badge}
                                onChange={handleChange}
                                required
                            />

                            <InputField
                                label="Hero title"
                                name="hero_title"
                                value={form.hero_title}
                                onChange={handleChange}
                                required
                            />

                            <div className="md:col-span-2">
                                <InputField
                                    label="Hero summary"
                                    name="hero_summary"
                                    value={form.hero_summary}
                                    onChange={handleChange}
                                    textarea
                                />
                            </div>

                            <InputField
                                label="Submission process"
                                name="submission_process_title"
                                value={
                                    form.submission_process_title
                                }
                                onChange={handleChange}
                            />

                            <InputField
                                label="Full paper title"
                                name="full_paper_title"
                                value={form.full_paper_title}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Proceedings title"
                                name="proceedings_title"
                                value={form.proceedings_title}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Venue title"
                                name="venue_title"
                                value={form.venue_title}
                                onChange={handleChange}
                            />

                            <InputField
                                label="Contact title"
                                name="contact_title"
                                value={form.contact_title}
                                onChange={handleChange}
                            />

                            <div className="md:col-span-2">
                                <button className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3 font-semibold text-white">
                                    <Save size={18} />
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AboutEvents;