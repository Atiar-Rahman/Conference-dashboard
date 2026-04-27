import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

import { readStoredAuth } from "../lib/authStorage";
import { getConference } from "../lib/api";

const sections = [
    "About events",
    "Archive links",
    "Archives",
    "Committee groups",
    "Committee members",
    "Contact infos",
    "Hero highlights",
    "Hero info cards",
    "Hero sections",
];

const ConferenceLayout = () => {
    const navigate = useNavigate();
    const { conferencePk } = useParams();
    const token = readStoredAuth()?.access;

    const [conference, setConference] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadConference = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getConference(conferencePk, token);
                setConference(data);
            } catch (err) {
                console.error(err);
                setError(err.message || "Failed to load conference");
            } finally {
                setLoading(false);
            }
        };

        if (conferencePk) {
            loadConference();
        }
    }, [conferencePk, token]);

    if (loading) {
        return (
            <div className="rounded-[30px] bg-white p-6 shadow-panel">
                Loading conference...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-[30px] bg-white p-6 shadow-panel text-red-600">
                {error}
            </div>
        );
    }

    if (!conference) {
        return (
            <div className="rounded-[30px] bg-white p-6 shadow-panel">
                Conference not found
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* top bar */}
            <section className="rounded-[30px] bg-white p-6 shadow-panel">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <button
                            onClick={() => navigate("/conference")}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-black"
                        >
                            <ArrowLeft size={16} />
                            Back to Conferences
                        </button>

                        <h1 className="text-3xl font-semibold text-slate-900">
                            {conference.name}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            {conference.location} • {conference.start_date} →{" "}
                            {conference.end_date}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Conference ID: {conference.id}
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/conference?create=true")}
                        className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white"
                    >
                        <Plus size={18} />
                        Create Conference
                    </button>
                </div>
            </section>

            {/* layout */}
            <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
                {/* sidebar */}
                <aside className="rounded-[30px] bg-white p-5 shadow-panel">
                    <h3 className="mb-5 text-lg font-semibold text-slate-900">
                        Conference Content
                    </h3>

                    <div className="space-y-2">
                        {sections.map((section) => {
                            const slug = section.toLowerCase().replaceAll(" ", "-");

                            return (
                                <NavLink
                                    key={section}
                                    to={`/conference/${conferencePk}/${slug}`}
                                    className={({ isActive }) =>
                                        `block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                                            ? "bg-black text-white"
                                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                        }`
                                    }
                                >
                                    {section}
                                </NavLink>
                            );
                        })}
                    </div>
                </aside>

                {/* page content */}
                <main className="rounded-[30px] bg-white p-6 shadow-panel min-h-[500px]">
                    <Outlet context={{ conference }} />
                </main>
            </section>
        </div>
    );
};

export default ConferenceLayout;