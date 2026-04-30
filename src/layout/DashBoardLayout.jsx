import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
    clearStoredAuth,
    readStoredAuth,
} from "../lib/authStorage";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = readStoredAuth();

    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login", { replace: true });
    };

    const headerData = useMemo(() => {
        const path = location.pathname;

        if (path === "/") {
            return {
                title: "Dashboard",
                subtitle: "Conference management system",
            };
        }

        if (path.startsWith("/users")) {
            return {
                title: "Users",
                subtitle: "Manage system users",
            };
        }

        if (path.startsWith("/reviewers")) {
            return {
                title: "Reviewers",
                subtitle: "Manage reviewers",
            };
        }

        if (path.startsWith("/submissions")) {
            return {
                title: "Submissions",
                subtitle: "Manage submissions",
            };
        }
        if (path.startsWith("/contact")) {
            return {
                title: "All Contact",
                subtitle: "Manage Contact",
            };
        }
        if (path.startsWith("/callpapers")) {
            return {
                title: "Call for Papers",
                subtitle: "Manage Call for paper",
            };
        }

        if (path.startsWith("/conferences")) {
            return {
                title: "Conferences",
                subtitle: "Manage conferences",
            };
        }

        if (path.startsWith("/conference/")) {
            return {
                title: "Conference",
                subtitle: "Manage conference content",
            };
        }

        return {
            title: "Dashboard",
            subtitle: "Conference management system",
        };
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-mesh">
            <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
                <Sidebar
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                />

                <main className="min-w-0">
                    <Header
                        title={headerData.title}
                        subtitle={headerData.subtitle}
                        auth={auth}
                        onMenuClick={() => setMenuOpen(true)}
                        onLogout={handleLogout}
                    />

                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;