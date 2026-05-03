import { Outlet, NavLink } from "react-router-dom";
import { RotateCcw, Trash2 } from "lucide-react";

const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border
  ${isActive
        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
    }`;

export default function RestoreAndDeleteLayout() {
    const menus = [
        {
            name: "Conference",
            path: "conference",
        },
        {
            name: "Event",
            path: "event",
        },
        {
            name: "Paper",
            path: "paper",
        },
        {
            name: "Review",
            path: "review",
        },
        {
            name: "Reviewer",
            path: "reviewer",
        },
        {
            name: "Session",
            path: "session",
        },
        {
            name: "Track",
            path: "track",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6 space-y-6">
                {/* header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <Trash2 size={20} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Restore & Hard Delete
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Restore deleted records or permanently remove them.
                            </p>
                        </div>
                    </div>
                </div>

                {/* nav */}
                <div className="sticky top-4 z-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-wrap gap-3">
                        {menus.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={linkClass}
                            >
                                <RotateCcw size={16} />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                </div>

                {/* content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}