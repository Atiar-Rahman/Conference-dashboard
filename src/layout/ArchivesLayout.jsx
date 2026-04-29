import { NavLink, Outlet, useParams } from "react-router-dom";
import { Archive, Link as LinkIcon } from "lucide-react";

const ArchivesLayout = () => {
    const { conferencePk, archivePk } = useParams();

    const tabs = [
        {
            name: "Archives",
            icon: Archive,
            path: `/conference/${conferencePk}/archives`,
        },
    ];

    if (archivePk) {
        tabs.push({
            name: "Archive Links",
            icon: LinkIcon,
            path: `/conference/${conferencePk}/archives/${archivePk}/archive-links`,
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Archives Section
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Manage archives and archive links
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

export default ArchivesLayout;