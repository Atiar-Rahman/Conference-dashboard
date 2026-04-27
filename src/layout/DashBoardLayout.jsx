import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
    clearStoredAuth,
    readStoredAuth,
} from "../lib/authStorage";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const auth = readStoredAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        clearStoredAuth();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-mesh">
            <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
                {/* Sidebar call */}
                <Sidebar
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                />

                {/* Main */}
                <main className="min-w-0">
                    <Header
                        title="Dashboard"
                        subtitle="Conference management system"
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