import { NavLink, Outlet, useParams } from "react-router-dom";
import {
    FileText,
    Sparkles,
    Target,
    Handshake,
    MapPin,
} from "lucide-react";

const AboutEventLayout = () => {
    const { conferencePk, eventPk } = useParams();

    const tabs = [
        {
            name: "About Event",
            icon: FileText,
            path: `/conference/${conferencePk}/about-events`,
        },
    ];

    if (eventPk) {
        tabs.push(
            {
                name: "Hero Highlights",
                icon: Sparkles,
                path: `/conference/${conferencePk}/about-events/${eventPk}/herohighlights`,
            },
            {
                name: "Indexing Target",
                icon: Target,
                path: `/conference/${conferencePk}/about-events/${eventPk}/indexing-target`,
            },
            {
                name: "Sponsor",
                icon: Handshake,
                path: `/conference/${conferencePk}/about-events/${eventPk}/sponsor`,
            },
            {
                name: "Venue Item",
                icon: MapPin,
                path: `/conference/${conferencePk}/about-events/${eventPk}/venue-item`,
            }
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    About Event Section
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Manage event content and nested sections
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

export default AboutEventLayout;