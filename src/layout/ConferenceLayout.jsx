import { Plus } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

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

const conferences = [
    {
        id: 1,
        title: "ASS",
        subtitle: "sdf • 2026-04-02 → 2026-04-30",
        active: true,
    },
    {
        id: 2,
        title: "A",
        subtitle: "a • 2026-04-15 → 2026-05-06",
        active: false,
    },
];

const ConferenceLayout = () => {
    return (
        <div className="space-y-6">
            {/* top */}
            <section className="rounded-[30px] bg-white p-6 shadow-panel">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            Conference
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage conference settings
                        </p>
                    </div>

                    <button className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
                        <Plus size={18} />
                        Create conference
                    </button>
                </div>

                <div className="space-y-3">
                    {conferences.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {item.subtitle}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-4 py-2 text-xs font-semibold ${item.active
                                        ? "bg-ink text-white"
                                        : "bg-slate-200 text-slate-600"
                                    }`}
                            >
                                {item.active ? "Active" : "Draft"}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* bottom */}
            <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
                {/* sidebar */}
                <aside className="rounded-[30px] bg-white p-5 shadow-panel">
                    <h3 className="mb-5 text-lg font-semibold text-slate-900">
                        Conference content
                    </h3>

                    <div className="space-y-2">
                        {sections.map((section) => (
                            <NavLink
                                key={section}
                                to={section
                                    .toLowerCase()
                                    .replaceAll(" ", "-")}
                                className={({ isActive }) =>
                                    `block rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                                        ? "bg-ink text-white"
                                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                    }`
                                }
                            >
                                {section}
                            </NavLink>
                        ))}
                    </div>
                </aside>

                {/* content */}
                <main className="rounded-[30px] bg-white p-6 shadow-panel">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                                Selected section
                            </p>

                            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                                Important dates
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Active conference: ASS
                            </p>
                        </div>

                        <button className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white">
                            <Plus size={18} />
                            Add new
                        </button>
                    </div>

                    <Outlet />
                </main>
            </section>
        </div>
    );
};

export default ConferenceLayout;