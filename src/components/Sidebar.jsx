import {
  BellRing,
  CalendarRange,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
const conferenceId =  'f8fddccb-8763-4188-98b8-7203a1762a94';
const items = [
  { label: "Overview", to: "/", icon: LayoutDashboard },
  { label: "Submissions", to: "/submissions", icon: FileText },
  { label: "Reviewers", to: "/reviewers", icon: ShieldCheck },
  { label: "Users", to: "/users", icon: Users },
  {
    label: "Conference",
    to: `/conference/${conferenceId}`,
    icon: CalendarRange,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full flex-col justify-between rounded-none border-r border-slate-200 bg-white/80 px-4 py-6 backdrop-blur xl:rounded-r-[28px]">
      <div>
        <div className="mb-8 flex items-center gap-3 px-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white">
            DC
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">DUET</p>
            <h1 className="text-lg font-semibold text-slate-900">Conference Admin</h1>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-ink text-white shadow-panel"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="rounded-3xl bg-mesh p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current cycle</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">DUET Research Conference 2026</p>
        <p className="mt-2 text-sm text-slate-600">Manage deadlines, reviewers, sessions, and publication from one workspace.</p>
        <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
          <Settings size={16} />
          System settings
        </button>
      </div>
    </aside>
  );
}
