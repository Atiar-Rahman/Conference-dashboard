import { NavLink, Outlet, useParams } from "react-router-dom";
import { FileText, Users, ClipboardCheck, RefreshCcw } from "lucide-react";

const PaperLayout = () => {
    const { conferencePk, trackPk, paperPk } = useParams();

    const tabs = [
        {
            name: "Papers",
            icon: FileText,
            path: `/conference/${conferencePk}/track/${trackPk}/papers`,
        },
    ];

    if (paperPk) {
        tabs.push(
            {
                name: "Co Author",
                icon: Users,
                path: `/conference/${conferencePk}/track/${trackPk}/papers/${paperPk}/co-author`,
            },
            {
                name: "Review Assign",
                icon: ClipboardCheck,
                path: `/conference/${conferencePk}/track/${trackPk}/papers/${paperPk}/review-assign`,
            },
            {
                name: "Status Update",
                icon: RefreshCcw,
                path: `/conference/${conferencePk}/track/${trackPk}/papers/${paperPk}/status-update`,
            }
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Paper Management
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Manage papers and nested paper data
                </p>
            </div>

            <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-3">
                {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <NavLink
                            key={tab.name}
                            to={tab.path}
                            end={tab.name === "Papers"}
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

export default PaperLayout;