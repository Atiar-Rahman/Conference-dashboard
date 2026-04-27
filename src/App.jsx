import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ConferencePage from "./pages/ConferencePage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import OverviewPage from "./pages/OverviewPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReviewersPage from "./pages/ReviewersPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import UsersPage from "./pages/UsersPage";
import { AUTH_STORAGE_KEY, readStoredAuth } from "./lib/authStorage";

const pageMeta = {
  "/": {
    title: "Overview",
    subtitle: "Admin dashboard for conference workflow, decisions, schedule, and payments",
  },
  "/submissions": {
    title: "Submissions",
    subtitle: "Track PDFs, review progress, decisions, and deadlines",
  },
  "/reviewers": {
    title: "Reviewers",
    subtitle: "Monitor assignments, review quality, and turnaround time",
  },
  "/users": {
    title: "Users",
    subtitle: "Manage role-based access for admins, authors, reviewers, and guests",
  },
  "/conference": {
    title: "Conference",
    subtitle: "Configure tracks, dates, schedule sessions, and publish accepted papers",
  },
  "/notifications": {
    title: "Notifications",
    subtitle: "Prepare and automate email communication for the conference lifecycle",
  },
  "/payments": {
    title: "Payments",
    subtitle: "Track registration fee collection and payment gateway status",
  },
};

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function DashboardLayout({ auth, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { title, subtitle } = pageMeta[location.pathname] || pageMeta["/"];

  return (
    <div className="min-h-screen bg-mesh text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <div
          className={[
            "fixed inset-y-0 left-0 z-40 w-[280px] transition lg:static lg:w-auto",
            menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <Sidebar />
        </div>

        {menuOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        <main className="min-w-0">
          <Header
            title={title}
            subtitle={subtitle}
            onMenuClick={() => setMenuOpen(true)}
            onLogout={onLogout}
          />
          <div className="p-4 md:p-8">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/submissions" element={<SubmissionsPage />} />
              <Route path="/reviewers" element={<ReviewersPage />} />
              <Route path="/users" element={<UsersPage auth={auth} />} />
              <Route path="/conference" element={<ConferencePage auth={auth} />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState(() => readStoredAuth());

  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  useEffect(() => {
    const handleAuthUpdated = () => {
      setAuth(readStoredAuth());
    };

    const handleStorage = (event) => {
      if (event.key !== AUTH_STORAGE_KEY) {
        return;
      }
      setAuth(readStoredAuth());
    };

    window.addEventListener("conference_admin_auth_updated", handleAuthUpdated);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("conference_admin_auth_updated", handleAuthUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLoginSuccess = (session) => {
    setAuth(session);
    navigate("/", { replace: true });
  };

  const handleLogout = () => {
    setAuth(null);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={auth ? <Navigate to="/" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute isAuthenticated={Boolean(auth?.access)}>
            <DashboardLayout auth={auth} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
