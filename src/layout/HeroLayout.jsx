import { NavLink, Outlet, useParams } from "react-router-dom";
import { Image, Info, ImagePlus } from "lucide-react";

const HeroLayout = () => {
    const { conferencePk, heroPk } = useParams();

    const tabs = [
        {
            name: "Hero",
            icon: Image,
            path: `/conference/${conferencePk}/hero`,
        },
    ];

    if (heroPk) {
        tabs.push(
            {
                name: "Hero Info",
                icon: Info,
                path: `/conference/${conferencePk}/hero/${heroPk}/hero-info`,
            },
            {
                name: "Hero Image",
                icon: ImagePlus,
                path: `/conference/${conferencePk}/hero/${heroPk}/hero-image`,
            }
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Hero Section
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Manage hero content
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

export default HeroLayout;