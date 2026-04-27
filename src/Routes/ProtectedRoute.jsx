import { Navigate, Outlet } from "react-router-dom";
import { readStoredAuth } from "../lib/authStorage";

const ProtectedRoute = () => {
    const auth = readStoredAuth();

    console.log("auth:", auth);

    if (!auth?.access) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;