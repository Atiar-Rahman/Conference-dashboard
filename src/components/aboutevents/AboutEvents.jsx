import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    Save,
    X,
    Loader2,
    Sparkles,
    Target,
    Handshake,
    MapPin,
} from "lucide-react";
import Swal from "sweetalert2";
import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

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

const fields = [
    ["Hero badge", "hero_badge", false, true],
    ["Hero title", "hero_title", false, true],
    ["Hero summary", "hero_summary", true],
    ["Submission process title", "submission_process_title"],
    ["Full paper title", "full_paper_title"],
    ["Proceedings title", "proceedings_title"],
    ["Venue title", "venue_title"],
    ["Submission path title", "submission_path_title"],
    ["Where to submit title", "where_to_submit_title"],
    ["Indexing title", "indexing_title"],
    ["Indexing disclaimer", "indexing_disclaimer", true],
    ["Sponsors title", "sponsors_title"],
    ["Sponsors disclaimer", "sponsors_disclaimer", true],
    ["Timeline title", "timeline_title"],
    ["Fees title", "fees_title"],
    ["Fees summary", "fees_summary", true],
    ["Contact title", "contact_title"],
];

const InputField = ({
    label,
    name,
    value,
    onChange,
    textarea = false,
    required = false,
}) => (
    <div className={textarea ? "md:col-span-2" : ""}>
        <label className="mb-2 block text-sm font-medium text-slate-700">
            {label}
        </label>

        {textarea ? (
            <textarea
                rows={4}
                name={name}
                value={value || ""}
                onChange={onChange}
                required={required}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
            />
        ) : (
            <input
                type="text"
                name={name}
                value={value || ""}
                onChange={onChange}
                required={required}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-black"
            />
        )}
    </div>
);

export default function AboutEvents() {
    const navigate = useNavigate();
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [items, setItems] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const endpoint = `/api/v1/conferences/${conferencePk}/about-event/`;

    // camelCase -> snake_case normalize
    const normalizeApiData = (item) => ({
        hero_badge: item.hero_badge || item.heroBadge || "",
        hero_title: item.hero_title || item.heroTitle || "",
        hero_summary: item.hero_summary || item.heroSummary || "",
        submission_process_title:
            item.submission_process_title ||
            item.submissionProcessTitle ||
            "",
        full_paper_title:
            item.full_paper_title || item.fullPaperTitle || "",
        proceedings_title:
            item.proceedings_title || item.proceedingsTitle || "",
        venue_title: item.venue_title || item.venueTitle || "",
        submission_path_title:
            item.submission_path_title ||
            item.submissionPathTitle ||
            "",
        where_to_submit_title:
            item.where_to_submit_title ||
            item.whereToSubmitTitle ||
            "",
        indexing_title:
            item.indexing_title || item.indexingTitle || "",
        indexing_disclaimer:
            item.indexing_disclaimer ||
            item.indexingDisclaimer ||
            "",
        sponsors_title:
            item.sponsors_title || item.sponsorsTitle || "",
        sponsors_disclaimer:
            item.sponsors_disclaimer ||
            item.sponsorsDisclaimer ||
            "",
        timeline_title:
            item.timeline_title || item.timelineTitle || "",
        fees_title: item.fees_title || item.feesTitle || "",
        fees_summary:
            item.fees_summary || item.feesSummary || "",
        contact_title:
            item.contact_title || item.contactTitle || "",
    });

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
        if (conferencePk) loadItems();
    }, [conferencePk]);

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
        setForm(normalizeApiData(item));
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitLoading(true);

            if (editing?.id) {
                await apiRequest(`${endpoint}${editing.id}/`, {
                    method: "PATCH",
                    token,
                    csrf: true,
                    body: JSON.stringify(form),
                });
            } else {
                await apiRequest(endpoint, {
                    method: "POST",
                    token,
                    csrf: true,
                    body: JSON.stringify(form),
                });
            }

            Swal.fire({
                icon: "success",
                title: "Success",
                timer: 1000,
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
        await apiRequest(`${endpoint}${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

        loadItems();
    };

    const openHeroHighlights = (id) =>
        navigate(`/conference/${conferencePk}/about-events/${id}/herohighlights`);

    const openIndexingTarget = (id) =>
        navigate(`/conference/${conferencePk}/about-events/${id}/indexing-target`);

    const openSponsor = (id) =>
        navigate(`/conference/${conferencePk}/about-events/${id}/sponsor`);

    const openVenueItem = (id) =>
        navigate(`/conference/${conferencePk}/about-events/${id}/venue-item`);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Manage about event content
                </p>

                {!items.length && (
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white"
                    >
                        <Plus size={18} />
                        Add About Event
                    </button>
                )}
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading...
                    </div>
                ) : !items.length ? (
                    <div className="py-20 text-center text-slate-500">
                        No about event found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead className="border-b bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                        Hero Badge
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                        Hero Title
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                        Summary
                                    </th>

                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                                        Manage
                                    </th>

                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b transition hover:bg-slate-50"
                                    >
                                        {/* badge */}
                                        <td className="px-6 py-5">
                                            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                                                {item.heroBadge || item.hero_badge}
                                            </span>
                                        </td>

                                        {/* title */}
                                        <td className="px-6 py-5">
                                            <h3 className="font-semibold text-slate-900">
                                                {item.heroTitle || item.hero_title}
                                            </h3>
                                        </td>

                                        {/* summary */}
                                        <td className="max-w-md px-6 py-5 text-sm text-slate-500">
                                            <p className="line-clamp-2">
                                                {item.heroSummary ||
                                                    item.hero_summary ||
                                                    "-"}
                                            </p>
                                        </td>

                                        {/* manage buttons */}
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap justify-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        openHeroHighlights(item.id)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                                                >
                                                    <Sparkles size={15} />
                                                    Highlights
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openIndexingTarget(item.id)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-200"
                                                >
                                                    <Target size={15} />
                                                    Indexing
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openSponsor(item.id)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
                                                >
                                                    <Handshake size={15} />
                                                    Sponsor
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openVenueItem(item.id)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-100 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-200"
                                                >
                                                    <MapPin size={15} />
                                                    Venue
                                                </button>
                                            </div>
                                        </td>

                                        {/* action */}
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="rounded-xl bg-slate-100 p-3 hover:bg-slate-200"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(item.id)
                                                    }
                                                    className="rounded-xl bg-red-100 p-3 text-red-600 hover:bg-red-200"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-8">
                        <div className="mb-6 flex justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing ? "Edit" : "Create"} About Event
                            </h2>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="grid gap-5 md:grid-cols-2"
                        >
                            {fields.map(
                                ([label, name, textarea, required]) => (
                                    <InputField
                                        key={name}
                                        label={label}
                                        name={name}
                                        value={form[name]}
                                        onChange={handleChange}
                                        textarea={textarea}
                                        required={required}
                                    />
                                )
                            )}

                            <div className="md:col-span-2">
                                <button className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-semibold text-white">
                                    <Save size={18} />
                                    {submitLoading
                                        ? "Saving..."
                                        : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}