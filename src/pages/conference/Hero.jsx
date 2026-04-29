import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Save,
    Loader2,
    Image,
    Info,
    CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";

import { readStoredAuth } from "../../lib/authStorage";
import { apiRequest } from "../../lib/api";

const initialForm = {
    eyebrow: "",
    pretitle: "",
    title: "",
    date_line: "",
    summary: "",
    cta_primary_label: "",
    cta_primary_link: "",
    cta_secondary_label: "",
    cta_secondary_link: "",
};

const Hero = () => {
    const { conferencePk } = useParams();
    const navigate = useNavigate();
    const token = readStoredAuth()?.access;

    const [heroes, setHeroes] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, reset } = useForm({
        defaultValues: initialForm,
    });

    // ================= API =================
    const endpoint = `/api/v1/conferences/${conferencePk}/hero/`;

    const getHeroes = () =>
        apiRequest(endpoint, {
            method: "GET",
            token,
            csrf: true,
        });

    const createHero = (payload) =>
        apiRequest(endpoint, {
            method: "POST",
            token,
            csrf: true,
            body: JSON.stringify(payload),
        });

    const updateHero = async (id, payload) => {
        const path = `${endpoint}${id}/`;

        try {
            return await apiRequest(path, {
                method: "PATCH",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            });
        } catch {
            return apiRequest(path, {
                method: "PUT",
                token,
                csrf: true,
                body: JSON.stringify(payload),
            });
        }
    };

    const deleteHero = (id) =>
        apiRequest(`${endpoint}${id}/`, {
            method: "DELETE",
            token,
            csrf: true,
        });

    // ================= LOAD =================
    const loadHeroes = async () => {
        try {
            setLoading(true);

            const data = await getHeroes();

            const parsed = Array.isArray(data)
                ? data
                : data?.results
                    ? data.results
                    : data
                        ? [data]
                        : [];

            setHeroes(parsed);
        } catch (err) {
            setError(err.message);
            setHeroes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (conferencePk) loadHeroes();
    }, [conferencePk]);

    // ================= NAVIGATION =================
    const openHero = (heroId) => {
        navigate(`/conference/${conferencePk}/hero/${heroId}/hero-info`);
    };

    const openHeroInfo = (heroId) => {
        navigate(`/conference/${conferencePk}/hero/${heroId}/hero-info`);
    };

    const openHeroImage = (heroId) => {
        navigate(`/conference/${conferencePk}/hero/${heroId}/hero-image`);
    };

    // ================= FORM =================
    const openCreate = () => {
        setEditing(null);
        reset(initialForm);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        reset(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setEditing(null);
        reset(initialForm);
        setShowModal(false);
    };

    const onSubmit = async (data) => {
        try {
            setSubmitLoading(true);

            if (editing?.id) {
                await updateHero(editing.id, data);
            } else {
                await createHero(data);
            }

            closeModal();
            loadHeroes();

            Swal.fire("Success", "Saved successfully", "success");
        } catch (err) {
            Swal.fire("Error", err.message, "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await Swal.fire({
            title: "Delete Hero?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
        });

        if (!ok.isConfirmed) return;

        await deleteHero(id);
        loadHeroes();
    };

    return (
        <div className="space-y-6">
            {/* top */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Hero</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Create / Update / Delete hero section
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white"
                >
                    <Plus size={18} />
                    Add Hero
                </button>
            </div>

            {/* list */}
            <div className="rounded-[30px] bg-white p-6 shadow-panel">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : !heroes.length ? (
                    <p>No hero found</p>
                ) : (
                    <div className="space-y-4">
                        {heroes.map((hero) => (
                            <div
                                key={hero.id}
                                onClick={() => openHero(hero.id)}
                                className="cursor-pointer rounded-3xl border border-slate-200 p-5 hover:border-black hover:shadow-md transition"
                            >
                                <div className="flex justify-between gap-4">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">{hero.title}</h3>

                                        <p className="text-sm text-slate-500">
                                            {hero.eyebrow}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {hero.date_line}
                                        </p>

                                        <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                                            <CheckCircle2 size={15} />
                                            Active Hero
                                        </span>
                                    </div>

                                    {/* stop bubbling */}
                                    <div
                                        className="flex gap-2 flex-wrap"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => openHeroInfo(hero.id)}
                                            className="rounded-2xl bg-blue-100 px-4 py-3 text-blue-700"
                                        >
                                            <Info size={18} />
                                        </button>

                                        <button
                                            onClick={() => openHeroImage(hero.id)}
                                            className="rounded-2xl bg-emerald-100 px-4 py-3 text-emerald-700"
                                        >
                                            <Image size={18} />
                                        </button>

                                        <button
                                            onClick={() => openEdit(hero)}
                                            className="rounded-2xl bg-slate-100 p-3"
                                        >
                                            <Pencil size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(hero.id)}
                                            className="rounded-2xl bg-red-100 p-3 text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-4xl rounded-3xl bg-white p-8">
                        <div className="mb-6 flex justify-between">
                            <h2 className="text-2xl font-semibold">
                                {editing ? "Update Hero" : "Create Hero"}
                            </h2>

                            <button onClick={closeModal}>
                                <X />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="grid gap-4 md:grid-cols-2"
                        >
                            <input {...register("eyebrow")} placeholder="Eyebrow" className="rounded-2xl border p-4" />
                            <input {...register("pretitle")} placeholder="Pretitle" className="rounded-2xl border p-4" />
                            <input {...register("title")} placeholder="Title" className="rounded-2xl border p-4 md:col-span-2" />
                            <input {...register("date_line")} placeholder="Date line" className="rounded-2xl border p-4 md:col-span-2" />
                            <textarea {...register("summary")} rows={4} placeholder="Summary" className="rounded-2xl border p-4 md:col-span-2" />
                            <input {...register("cta_primary_label")} placeholder="Primary label" className="rounded-2xl border p-4" />
                            <input {...register("cta_primary_link")} placeholder="Primary link" className="rounded-2xl border p-4" />
                            <input {...register("cta_secondary_label")} placeholder="Secondary label" className="rounded-2xl border p-4" />
                            <input {...register("cta_secondary_link")} placeholder="Secondary link" className="rounded-2xl border p-4" />

                            <button
                                disabled={submitLoading}
                                className="rounded-2xl bg-black py-4 text-white md:col-span-2"
                            >
                                <Save className="inline mr-2" size={18} />
                                {submitLoading ? "Saving..." : "Save Hero"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hero;