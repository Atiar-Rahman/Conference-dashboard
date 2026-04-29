import { NavLink, Outlet, useParams } from "react-router-dom";
import { Users, UserRound } from "lucide-react";

const ConferenceCommiteeLayout = () => {
    const { conferencePk, groupPk } = useParams();

    const tabs = [
        {
            name: "Committee Group",
            icon: Users,
            path: `/conference/${conferencePk}/committee-groups`,
        },
    ];

    if (groupPk) {
        tabs.push({
            name: "Group Members",
            icon: UserRound,
            path: `/conference/${conferencePk}/committee-groups/${groupPk}/group-member`,
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Committee Section
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Manage committee groups and members
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

export default ConferenceCommiteeLayout;