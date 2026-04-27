import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function DashBoardLayout() {
    return (
        <div className="min-h-screen grid lg:grid-cols-[280px_1fr]">
            <Sidebar />

            <main>
                <Header />

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}