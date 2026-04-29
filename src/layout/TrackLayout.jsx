import { NavLink, Outlet, useParams } from "react-router-dom";
import { GitBranch, FileText } from "lucide-react";

const TrackLayout = () => {
    const { conferencePk, trackPk } = useParams();

    const tabs = [
        {
            name: "Track",
            icon: GitBranch,
            path: `/conference/${conferencePk}/track`,
        },
    ];

    if (trackPk) {
        tabs.push({
            name: "Papers",
            icon: FileText,
            path: `/conference/${conferencePk}/track/${trackPk}/papers`,
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Track Section
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Manage track and papers
                </p>
            </div>

            <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-3">
                {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <NavLink
                            key={tab.name}
                            to={tab.path}
                            end
                            className={({ isActive }) =>
                                `inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${isActive
                                    ? "bg-black text-white"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`
                            }
                        >
                            <Icon size={18} />
                            {tab.name}
                        </NavLink>
                    );
                })}
            </div>

            <Outlet />
        </div>
    );
};

export default TrackLayout;